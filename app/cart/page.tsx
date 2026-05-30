"use client";

import { clearCart, removeItemFromCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import Checkout from "./components/checkout";
import BucketImage from "@/app/components/image";
import { FiArrowRight, FiShoppingBag, FiTrash2, FiX } from "react-icons/fi";

type PaymentToken = "ETH" | "USDC";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useSelector((state: any) => state.auth.cart);
  const [paymentToken, setPaymentToken] = useState<PaymentToken>("ETH");

  if (!cart.products || cart.products.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-secondary border border-border-subtle">
            <FiShoppingBag size={28} className="text-text-muted" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white text-lg">Your cart is empty</p>
            <p className="text-sm text-text-secondary">Add something from a store to get started.</p>
          </div>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
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
      <h1 className="text-2xl font-bold mb-8">
        Your Cart{" "}
        <span className="text-base font-normal text-text-secondary ml-1">
          ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left: items */}
        <div className="space-y-3">
          {cart.products.map((item: any) => (
            <div
              key={item.ID}
              className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden">
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
                  className="font-semibold truncate hover:text-primary transition-colors block"
                >
                  {item.Name}
                </Link>
                <p className="text-xs text-text-secondary mt-0.5">
                  Qty {item.Quantity ?? 1} × {item.Price} {item.Unit}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-semibold">
                  {(item.Price * (item.Quantity ?? 1)).toFixed(4)}
                </p>
                <p className="text-xs text-text-muted">{item.Unit}</p>
              </div>

              <button
                onClick={() => dispatch(removeItemFromCart(item.ID))}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted hover:border-red-400 hover:text-red-400 transition-colors"
                aria-label="Remove"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={() => dispatch(clearCart())}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-red-400 transition-colors mt-2"
          >
            <FiTrash2 size={13} /> Clear cart
          </button>
        </div>

        {/* Right: summary + checkout */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* Order summary */}
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Order summary
            </p>

            <div className="space-y-2">
              {cart.products.map((item: any) => (
                <div key={item.ID} className="flex justify-between text-sm">
                  <span className="text-text-secondary truncate mr-3 max-w-[160px]">
                    {item.Name} ×{item.Quantity ?? 1}
                  </span>
                  <span className="shrink-0">
                    {(item.Price * (item.Quantity ?? 1)).toFixed(4)} {item.Unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg text-white">
                {paymentToken === "USDC"
                  ? `${cart.total.toFixed(2)} USDC`
                  : `${cart.total.toFixed(4)} ETH`}
              </span>
            </div>
          </div>

          {/* Payment token */}
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Pay with
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["ETH", "USDC"] as PaymentToken[]).map((token) => (
                <button
                  key={token}
                  onClick={() => setPaymentToken(token)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    paymentToken === token
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-subtle hover:border-primary text-text-secondary"
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout */}
          <Checkout paymentToken={paymentToken} />

          <p className="text-center text-xs text-text-muted">
            🔒 Escrowed payment — released on delivery
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
