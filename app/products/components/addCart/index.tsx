"use client";

import { ICartItem, IProduct } from "@/api/interfaces/products";
import { addItemsToCart } from "@/redux/slices/auth-slice";
import { RootState, useAppDispatch } from "@/redux/store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMinus, FiPlus, FiShoppingCart, FiLock } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const AddToCart = ({ product }: { product: IProduct }) => {
  const dispatch = useAppDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const [amount, setAmount] = useState(1);

  const handleAddToCart = () => {
    const existing = auth.cart.products;
    const total = auth.cart.total + product.Price * amount;
    const idx = existing.findIndex((p) => p.ID === product.ID);
    const products: ICartItem[] =
      idx > -1
        ? existing.map((p, i) =>
            i === idx ? { ...p, Quantity: p.Quantity + amount } : p
          )
        : [...existing, { ...product, Quantity: amount }];
    dispatch(addItemsToCart({ products, total }));
    toast.success(`${amount} × ${product.Name} added to cart`);
  };

  if (!auth.isLoggedIn) {
    return (
      <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-3">
        <div className="flex items-center gap-2 text-body text-vault-text-secondary">
          <FiLock size={14} />
          Sign in to purchase this product.
        </div>
        <Link
          href={`/auth/login?next=${encodeURIComponent(pathname)}`}
          className="flex w-full items-center justify-center gap-2 bg-vault-accent text-vault-on-accent font-semibold py-3 rounded-vault-md hover:opacity-90 transition-opacity"
        >
          Sign in to buy
        </Link>
      </div>
    );
  }

  const total = (product.Price * amount).toFixed(4);

  return (
    <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-5">
      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-body-strong text-vault-text-secondary">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            disabled={amount <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-vault border border-vault-border text-vault-text hover:border-vault-border-accent hover:text-vault-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-vault-border disabled:hover:text-vault-text"
          >
            <FiMinus size={14} />
          </button>
          <span className="w-6 text-center font-semibold text-vault-text" aria-live="polite">{amount}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setAmount((a) => a + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-vault border border-vault-border text-vault-text hover:border-vault-border-accent hover:text-vault-accent transition-colors"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-vault-border pt-4">
        <span className="text-body text-vault-text-secondary">Total</span>
        <span className="text-h3 font-bold text-vault-text">
          {total} {product.Unit}
        </span>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        className="flex w-full items-center justify-center gap-2 bg-vault-accent text-vault-on-accent font-semibold py-3.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow"
      >
        <FiShoppingCart size={18} />
        Add to cart
      </button>

      {/* Escrow note */}
      <p className="flex items-center justify-center gap-1.5 text-center text-caption text-vault-text-tertiary">
        <FiLock size={12} /> Protected by on-chain escrow
      </p>
    </div>
  );
};

export default AddToCart;
