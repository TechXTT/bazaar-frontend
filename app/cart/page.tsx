"use client";

import { clearCart, removeItemFromCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import Checkout from "./components/checkout";
import BucketImage from "@/app/components/image";

type PaymentToken = "ETH" | "USDC";

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useSelector((state: any) => state.auth.cart);
  const [paymentToken, setPaymentToken] = useState<PaymentToken>("ETH");

  if (!cart.products || cart.products.length === 0) {
    return (
      <div className="flex w-full justify-center items-center py-40">
        <div className="text-center space-y-4">
          <p className="text-xl text-text-secondary">Your cart is empty</p>
          <Link
            href="/stores"
            className="inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-colors"
          >
            Browse stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-28 space-y-8">
      <h1 className="text-2xl font-bold">Your Cart</h1>

      {/* Item list */}
      <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle overflow-hidden">
        {cart.products.map((item: any) => (
          <div key={item.ID} className="flex items-center gap-4 p-4 bg-bg-secondary">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
              <BucketImage
                key={item.ID}
                imageURL={item.ImageURL}
                name={item.Name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.Name}</p>
              <p className="text-sm text-text-secondary">
                Qty: {item.Quantity ?? 1}
              </p>
            </div>
            <span className="shrink-0 font-semibold">
              ${((item.Price * (item.Quantity ?? 1))).toFixed(2)} {item.Unit}
            </span>
            <button
              onClick={() => dispatch(removeItemFromCart(item.ID))}
              className="shrink-0 text-text-secondary hover:text-red-500 transition-colors text-sm px-2 py-1"
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4 space-y-2">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>{cart.products.length} item{cart.products.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment token selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Pay with</p>
        <div className="flex gap-3">
          {(["ETH", "USDC"] as PaymentToken[]).map((token) => (
            <button
              key={token}
              onClick={() => setPaymentToken(token)}
              className={`px-5 py-2 rounded-lg border font-semibold text-sm transition-colors ${
                paymentToken === token
                  ? "border-primary bg-primary text-white"
                  : "border-border-subtle bg-bg-secondary hover:border-primary"
              }`}
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Checkout paymentToken={paymentToken} />
        <button
          className="w-full border border-border-subtle text-text-secondary py-2 rounded-lg text-sm hover:border-red-400 hover:text-red-400 transition-colors"
          onClick={() => dispatch(clearCart())}
        >
          Clear cart
        </button>
      </div>
    </div>
  );
};

export default CartPage;
