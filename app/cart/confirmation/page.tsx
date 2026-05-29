"use client";

import { CONFIG } from "@/config/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCheckCircle, FiExternalLink, FiShoppingBag } from "react-icons/fi";

type ConfirmationOrder = { name: string; quantity: number };
type ConfirmationPayload = {
  orders: ConfirmationOrder[];
  timestamp: number;
  total: number;
  txs: string[];
  token: "ETH" | "USDC";
};

const STORAGE_KEY = "bazaar.checkout.confirmation";

export default function CartConfirmationPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<ConfirmationPayload | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) { router.replace("/orders"); return; }
    setPayload(JSON.parse(raw));
    return () => { window.sessionStorage.removeItem(STORAGE_KEY); };
  }, [router]);

  if (!payload) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary border border-border-subtle">
            <FiShoppingBag size={24} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary">No checkout summary available.</p>
          <Link href="/orders" className="text-sm text-primary hover:underline">
            View your orders →
          </Link>
        </div>
      </div>
    );
  }

  const totalFormatted = payload.token === "USDC"
    ? `${payload.total.toFixed(2)} USDC`
    : `${payload.total.toFixed(4)} ETH`;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      {/* Success icon */}
      <div className="text-center space-y-4 mb-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10 border border-green-500/20">
          <FiCheckCircle size={40} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Order confirmed!</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Your payment cleared and escrow contracts were created.
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border-subtle bg-bg-secondary overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Items ordered</p>
        </div>
        <div className="divide-y divide-border-subtle">
          {payload.orders.map((order, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-white">{order.name}</span>
              <span className="text-text-secondary">×{order.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 bg-surface-sunken border-t border-border-subtle">
          <span className="text-sm text-text-secondary">Total paid</span>
          <span className="font-bold text-white">{totalFormatted}</span>
        </div>
      </div>

      {/* Transactions */}
      {payload.txs.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
            Transaction{payload.txs.length > 1 ? "s" : ""}
          </p>
          {payload.txs.map((tx) => (
            <a
              key={tx}
              href={CONFIG.ETHERSCAN_TX_BASE_URL ? `${CONFIG.ETHERSCAN_TX_BASE_URL}/${tx}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary transition-colors break-all group"
            >
              <FiExternalLink size={12} className="shrink-0 group-hover:text-primary" />
              {tx}
            </a>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/orders"
          className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm"
        >
          My orders <FiArrowRight size={14} />
        </Link>
        <Link
          href="/stores"
          className="flex items-center justify-center gap-2 border border-border-subtle font-semibold py-3 rounded-xl hover:border-primary hover:bg-bg-secondary transition-all text-sm"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
