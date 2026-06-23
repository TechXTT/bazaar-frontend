"use client";

import { clearCart, removeItemFromCart } from "@/redux/slices/auth-slice";
import { RootState, useAppDispatch } from "@/redux/store";
import Link from "next/link";
import { useSelector } from "react-redux";
import Checkout from "./components/checkout";
import BucketImage from "@/app/components/image";
import { FiArrowRight, FiLock, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";
import { settlementCurrencyFromUnit } from "@/utils/helpers";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useSelector((state: RootState) => state.auth.cart);

  // FE-3: the payment currency is the listing's denomination, not a free buyer
  // choice. Derive it from the cart items so the buyer can never pay a token the
  // price isn't denominated in. The cart can only be checked out if every item
  // settles in the same currency (mixed-currency carts are blocked below).
  const currencies = Array.from(
    new Set(cart.products.map((p) => settlementCurrencyFromUnit(p.Unit)))
  );
  const paymentToken = currencies[0] ?? "ETH";
  const mixedCurrencies = currencies.length > 1;
  const decimals = paymentToken === "USDC" ? 2 : 4;

  if (!cart.products || cart.products.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="relative space-y-5 overflow-hidden rounded-vault-xl border border-vault-border bg-vault-surface px-12 py-16 text-center">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-vault-accent/15 blur-[90px]" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-vault-lg border border-vault-border-accent bg-vault-accent-soft text-vault-accent">
            <FiShoppingBag size={28} />
          </div>
          <div className="relative space-y-1">
            <p className="text-h3 text-vault-text">Your cart is empty</p>
            <p className="text-body text-vault-text-secondary">Add something from a store to get started.</p>
          </div>
          <Link
            href="/stores"
            className="relative inline-flex items-center gap-2 rounded-vault-md bg-vault-accent px-6 py-3 text-body-strong text-vault-on-accent shadow-vault-glow transition hover:opacity-90"
          >
            Browse stores <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = cart.products.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-h1 font-bold mb-2 text-vault-text">Checkout</h1>
      <p className="text-body text-vault-text-secondary mb-8">
        Review your orders and fund each escrow on-chain. Funds go to the contract — never directly to the seller.
        <span className="ml-1 text-vault-text-tertiary">
          ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
      </p>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left: items */}
        <div className="space-y-3">
          {cart.products.map((item) => (
            <div
              key={item.ID}
              className="flex items-center gap-4 rounded-vault-lg border border-vault-border bg-vault-surface p-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-vault-md overflow-hidden">
                <BucketImage
                  key={item.ID}
                  imageURL={item.ImageURL}
                  name={item.Name}
                  className="h-full w-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.ID}`}
                  className="font-semibold truncate text-vault-text hover:text-vault-accent transition-colors block"
                >
                  {item.Name}
                </Link>
                <p className="text-caption text-vault-text-secondary mt-0.5">
                  Qty {item.Quantity ?? 1} × {item.Price} {item.Unit}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-semibold text-vault-text">
                  {(item.Price * (item.Quantity ?? 1)).toFixed(4)}
                </p>
                <p className="text-caption text-vault-text-tertiary">{item.Unit}</p>
              </div>

              <button
                onClick={() => dispatch(removeItemFromCart(item.ID))}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-vault border border-vault-border text-vault-text-tertiary hover:border-vault-danger hover:text-vault-danger transition-colors"
                aria-label="Remove"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={() => dispatch(clearCart())}
            className="inline-flex items-center gap-1.5 text-body text-vault-text-tertiary hover:text-vault-danger transition-colors mt-2"
          >
            <FiTrash2 size={13} /> Clear cart
          </button>
        </div>

        {/* Right: summary + checkout */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* Order summary */}
          <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-4">
            <p className="text-overline uppercase text-vault-text-tertiary">
              Order summary
            </p>

            <div className="space-y-2">
              {cart.products.map((item) => (
                <div key={item.ID} className="flex justify-between text-body">
                  <span className="text-vault-text-secondary truncate mr-3 max-w-[160px]">
                    {item.Name} ×{item.Quantity ?? 1}
                  </span>
                  <span className="shrink-0 text-vault-text">
                    {(item.Price * (item.Quantity ?? 1)).toFixed(4)} {item.Unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-vault-border pt-3 flex justify-between">
              <span className="font-semibold text-vault-text">Total</span>
              <span className="font-bold text-h3 text-vault-text">
                {cart.total.toFixed(decimals)} {paymentToken}
              </span>
            </div>
            <p className="text-caption text-vault-text-tertiary">
              No buyer fees — you pay the listed price. Funds are held in escrow and
              released to the seller on delivery.
            </p>
          </div>

          {/* Payment currency — fixed to the listing's denomination (FE-3) */}
          <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-2">
            <p className="text-overline uppercase text-vault-text-tertiary">
              Pay with
            </p>
            <div className="flex items-center justify-between rounded-vault-md border border-vault-border-accent bg-vault-accent-soft px-4 py-2.5">
              <span className="text-body-strong text-vault-accent">{paymentToken}</span>
              <span className="text-caption text-vault-text-tertiary">Listing currency</span>
            </div>
            {mixedCurrencies && (
              <p className="text-caption text-vault-danger" role="alert">
                Your cart mixes ETH- and USDC-priced items. Remove items so they
                share one currency before checking out.
              </p>
            )}
          </div>

          {/* Checkout */}
          <Checkout paymentToken={paymentToken} disabled={mixedCurrencies} />

          <p className="flex items-center justify-center gap-1.5 text-center text-caption text-vault-text-tertiary">
            <FiLock size={12} /> Escrowed payment — released on delivery
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
