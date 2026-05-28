"use client";

import { productsService } from "@/api";
import { CONFIG } from "@/config/config";
import { createOrder, createOrderERC20 } from "@/components/escrow";
import { clearCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { useSDK } from "@metamask/sdk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface CheckoutProps {
  paymentToken: "ETH" | "USDC";
}

const Checkout = ({ paymentToken }: CheckoutProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cart = useSelector((state: any) => state.auth.cart);
  const { sdk, connected } = useSDK();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    let buyerAddress = window.ethereum?.selectedAddress ?? "";

    if (!connected || !buyerAddress) {
      try {
        const accounts = await sdk?.connect();
        buyerAddress = (accounts as string[])?.[0] ?? "";
      } catch {
        toast.error("Failed to connect wallet");
        return;
      }
    }

    if (!buyerAddress) {
      toast.error("No wallet address found");
      return;
    }

    if (paymentToken === "USDC" && !CONFIG.USDC_ADDRESS) {
      toast.error("USDC not configured");
      return;
    }

    setLoading(true);
    try {
      const createdAt = new Date().toISOString();
      const orderReqs = cart.products.map((p: any) => ({
        CreatedAt: createdAt,
        ProductID: p.ID,
        Quantity: p.Quantity ?? 1,
        BuyerAddress: buyerAddress,
      }));

      const response = await productsService.createOrders(orderReqs);
      if (response.status !== 201) {
        toast.error("Failed to create orders");
        return;
      }

      const orderResponses: { id: string; owner_address: string }[] = response.data;
      const releaseTime = CONFIG.ESCROW_RELEASE_DAYS * 24 * 60 * 60;
      const txs: string[] = [];

      for (let i = 0; i < orderResponses.length; i++) {
        const order = orderResponses[i];
        const item = cart.products[i];
        const quantity = item.Quantity ?? 1;

        if (paymentToken === "USDC") {
          const amount = BigInt(Math.round(item.Price * quantity * 1e6));
          const { orderTx } = await createOrderERC20(
            order.id,
            item.ID,
            order.owner_address,
            releaseTime,
            amount
          );
          txs.push(orderTx.hash);
        } else {
          const { parseEther } = await import("ethers");
          const value = parseEther((item.Price * quantity).toString());
          const tx = await createOrder(
            order.id,
            item.ID,
            order.owner_address,
            releaseTime,
            value
          );
          txs.push(tx.hash);
        }
      }

      sessionStorage.setItem(
        "bazaar.checkout.confirmation",
        JSON.stringify({
          orders: cart.products.map((p: any) => ({
            name: p.Name,
            quantity: p.Quantity ?? 1,
          })),
          timestamp: Date.now(),
          total: cart.total,
          txs,
        })
      );

      dispatch(clearCart());
      router.push("/cart/confirmation");
    } catch (err: any) {
      const msg: string = err?.response?.data ?? err?.message ?? "Checkout failed";
      if (msg.includes("owner and buyer cannot be the same")) {
        toast.error("You cannot buy your own product");
        dispatch(clearCart());
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
      onClick={handleCheckout}
      disabled={loading || cart.products.length === 0}
    >
      {loading ? "Processing…" : `Pay with ${paymentToken}`}
    </button>
  );
};

export default Checkout;
