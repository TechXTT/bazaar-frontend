"use client";

import { productsService } from "@/api";
import { OrderResponse } from "@/api/interfaces/products";
import { CONFIG } from "@/config/config";
import { createOrder, createOrderERC20 } from "@/components/escrow";
import { clearCart } from "@/redux/slices/auth-slice";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSDK } from "@metamask/sdk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getErrorMessage, settlementCurrencyFromUnit } from "@/utils/helpers";

interface CheckoutProps {
  paymentToken: "ETH" | "USDC";
  disabled?: boolean;
}

const Checkout = ({ paymentToken, disabled = false }: CheckoutProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.auth.cart);
  const { sdk, connected } = useSDK();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    let buyerAddress = window.ethereum?.selectedAddress ?? "";

    if (!connected || !buyerAddress) {
      try {
        // Under e2e the SDK's remote connect() can't complete headlessly; ask the
        // injected provider for accounts directly (same result, no SDK round-trip).
        const accounts =
          process.env.NEXT_PUBLIC_E2E === "true"
            ? await window.ethereum!.request({ method: "eth_requestAccounts" })
            : await sdk?.connect();
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

    // Ensure MetaMask is on the correct network before proceeding
    try {
      const currentChainId = await window.ethereum!.request({ method: "eth_chainId" });
      if (currentChainId !== CONFIG.CHAIN_ID) {
        try {
          await window.ethereum!.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CONFIG.CHAIN_ID }],
          });
        } catch (switchErr: unknown) {
          if ((switchErr as { code?: number })?.code === 4902) {
            await window.ethereum!.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: CONFIG.CHAIN_ID,
                chainName: CONFIG.CHAIN_NAME,
                rpcUrls: [CONFIG.RPC_URL],
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              }],
            });
          } else {
            toast.error("Please switch to " + CONFIG.CHAIN_NAME + " in MetaMask");
            return;
          }
        }
      }
    } catch {
      toast.error("Could not verify network");
      return;
    }

    setLoading(true);
    try {
      const createdAt = new Date().toISOString();
      const orderReqs = cart.products.map((p) => ({
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

      const orderResponses: OrderResponse[] = response.data;
      const releaseTime = CONFIG.ESCROW_RELEASE_DAYS * 24 * 60 * 60;
      const txs: string[] = [];

      for (let i = 0; i < orderResponses.length; i++) {
        const order = orderResponses[i];
        const item = cart.products[i];
        const quantity = item.Quantity ?? 1;

        // FE-3: settle each item in the currency its Price is denominated in
        // (derived from the listing's Unit), converting explicitly. The buyer
        // never picks a token the price isn't denominated in.
        const currency = settlementCurrencyFromUnit(item.Unit);

        if (currency === "USDC") {
          const { parseUnits } = await import("ethers");
          const amount = parseUnits((item.Price * quantity).toString(), 6);
          const { orderTx } = await createOrderERC20(
            order.id, item.ID, order.owner_address, releaseTime, amount
          );
          txs.push(orderTx.hash);
        } else {
          const { parseEther } = await import("ethers");
          const value = parseEther((item.Price * quantity).toString());
          const tx = await createOrder(
            order.id, item.ID, order.owner_address, releaseTime, value
          );
          txs.push(tx.hash);
        }
      }

      sessionStorage.setItem(
        "bazaar.checkout.confirmation",
        JSON.stringify({
          orders: cart.products.map((p) => ({ name: p.Name, quantity: p.Quantity ?? 1 })),
          timestamp: Date.now(),
          total: cart.total,
          txs,
          token: paymentToken,
        })
      );

      dispatch(clearCart());
      router.push("/cart/confirmation");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Checkout failed");
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
      onClick={handleCheckout}
      disabled={loading || disabled || cart.products.length === 0}
      className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Processing…
        </>
      ) : (
        <>
          Pay with {paymentToken} <FiArrowRight size={16} />
        </>
      )}
    </button>
  );
};

export default Checkout;
