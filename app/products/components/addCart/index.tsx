"use client";

import { IProduct } from "@/api/interfaces/products";
import { addItemsToCart } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import Link from "next/link";
import { useState } from "react";
import { FiMinus, FiPlus, FiShoppingCart, FiLock } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const AddToCart = ({ product }: { product: IProduct }) => {
  const dispatch = useAppDispatch();
  const auth = useSelector((state: any) => state.auth);
  const [amount, setAmount] = useState(1);

  const handleAddToCart = () => {
    const existing = (auth.cart.products as any[]) ?? [];
    const total = auth.cart.total + product.Price * amount;
    const idx = existing.findIndex((p: any) => p.ID === product.ID);
    const products =
      idx > -1
        ? existing.map((p: any, i: number) =>
            i === idx ? { ...p, Quantity: p.Quantity + amount } : p
          )
        : [...existing, { ...product, Quantity: amount }];
    dispatch(addItemsToCart({ products, total }));
    toast.success(`${amount} × ${product.Name} added to cart`);
  };

  if (!auth.isLoggedIn) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <FiLock size={14} />
          Sign in to purchase this product.
        </div>
        <Link
          href="/auth/login"
          className="flex w-full items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Sign in to buy
        </Link>
      </div>
    );
  }

  const total = (product.Price * amount).toFixed(4);

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-5">
      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle hover:border-primary hover:text-primary transition-colors"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-6 text-center font-semibold">{amount}</span>
          <button
            onClick={() => setAmount((a) => a + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle hover:border-primary hover:text-primary transition-colors"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="text-sm text-text-secondary">Total</span>
        <span className="text-lg font-bold text-white">
          {total} {product.Unit}
        </span>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        className="flex w-full items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
      >
        <FiShoppingCart size={18} />
        Add to cart
      </button>

      {/* Escrow note */}
      <p className="text-center text-xs text-text-muted">
        🔒 Protected by on-chain escrow
      </p>
    </div>
  );
};

export default AddToCart;
