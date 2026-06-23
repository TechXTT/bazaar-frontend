"use client";

import { productsService } from "@/api";
import { orderResponseArraySchema } from "@/api/interfaces/products";
import { CONFIG } from "@/config/config";
import { createOrder, createOrderERC20 } from "@/components/escrow";
import { removeItemFromCart } from "@/redux/slices/auth-slice";
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

      // FE-12: validate the response shape before deriving any on-chain amount.
      const parsed = orderResponseArraySchema.safeParse(response.data);
      if (!parsed.success) {
        toast.error("Received an invalid order response — checkout aborted");
        return;
      }
      const orderResponses = parsed.data;
      const releaseTime = CONFIG.ESCROW_RELEASE_DAYS * 24 * 60 * 60;

      // FE-1: escrow txs are submitted one-by-one and any one can revert or be
      // rejected. Track per-item progress so that, on failure, we keep what already
      // succeeded, remove those items from the cart (a retry can't re-charge them),
      // and tell the buyer exactly how many of N were paid + what's left to retry.
      const paid: Array<{ id: string; name: string; quantity: number; txHash: string }> = [];
      const total = orderResponses.length;
      let failure: unknown = null;

      for (let i = 0; i < orderResponses.length; i++) {
        const order = orderResponses[i];
        // FE-2: correlate each created order to its cart item by ProductID when the
        // backend returns it (so a reordered/deduped response can't escrow the wrong
        // price against the wrong product); fall back to positional alignment only
        // while the backend response omits product_id.
        const item = order.product_id
          ? cart.products.find((p) => p.ID === order.product_id)
          : cart.products[i];
        if (!item) {
          failure = new Error("Could not match an escrow order to a cart item");
          break;
        }
        const quantity = item.Quantity ?? 1;

        // FE-3: settle each item in the currency its Price is denominated in
        // (derived from the listing's Unit), converting explicitly. The buyer
        // never picks a token the price isn't denominated in.
        const currency = settlementCurrencyFromUnit(item.Unit);

        try {
          let txHash: string;
          if (currency === "USDC") {
            const { parseUnits } = await import("ethers");
            const amount = parseUnits((item.Price * quantity).toString(), 6);
            const { orderTx } = await createOrderERC20(
              order.id, item.ID, order.owner_address, releaseTime, amount
            );
            txHash = orderTx.hash;
          } else {
            const { parseEther } = await import("ethers");
            const value = parseEther((item.Price * quantity).toString());
            const tx = await createOrder(
              order.id, item.ID, order.owner_address, releaseTime, value
            );
            txHash = tx.hash;
          }
          paid.push({ id: item.ID, name: item.Name, quantity, txHash });
        } catch (itemErr: unknown) {
          // Stop at the first failure; everything already escrowed is in `paid`.
          failure = itemErr;
          break;
        }
      }

      // Remove the items we successfully escrowed from the cart so a retry only
      // re-submits the remaining (still-unpaid) items — never re-charging a paid one.
      for (const p of paid) dispatch(removeItemFromCart(p.id));

      if (failure) {
        const msg = getErrorMessage(failure, "Checkout failed");
        if (msg.includes("owner and buyer cannot be the same")) {
          // The first item is the buyer's own product — drop it and surface why.
          const offending = cart.products.find((p) => !paid.some((q) => q.id === p.ID));
          if (offending) dispatch(removeItemFromCart(offending.ID));
          toast.error("You cannot buy your own product");
        } else if (paid.length > 0) {
          toast.error(
            `${paid.length} of ${total} paid — the rest failed and remain in your cart. Retry to finish them.`
          );
        } else {
          toast.error(msg);
        }
        return;
      }

      // All items escrowed — record the confirmation for the receipt screen.
      sessionStorage.setItem(
        "bazaar.checkout.confirmation",
        JSON.stringify({
          orders: paid.map((p) => ({ name: p.name, quantity: p.quantity })),
          timestamp: Date.now(),
          total: cart.total,
          txs: paid.map((p) => p.txHash),
          token: paymentToken,
        })
      );

      router.push("/cart/confirmation");
    } catch (err: unknown) {
      // Reaches here only for pre-escrow failures (order creation, network switch).
      toast.error(getErrorMessage(err, "Checkout failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || disabled || cart.products.length === 0}
      className="w-full flex items-center justify-center gap-2 bg-vault-accent text-vault-on-accent font-semibold py-3.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow disabled:opacity-50 disabled:cursor-not-allowed"
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
