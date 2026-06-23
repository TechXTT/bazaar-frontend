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
    try {
      setPayload(JSON.parse(raw) as ConfirmationPayload);
    } catch {
      router.replace("/orders");
      return;
    }
    return () => { window.sessionStorage.removeItem(STORAGE_KEY); };
  }, [router]);

  if (!payload) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-vault-lg bg-vault-surface border border-vault-border">
            <FiShoppingBag size={24} className="text-vault-text-tertiary" />
          </div>
          <p className="text-body text-vault-text-secondary">No checkout summary available.</p>
          <Link href="/orders" className="text-body text-vault-accent hover:underline">
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-vault-2xl bg-vault-success-soft border border-vault-success/30 shadow-vault-glow-success">
          <FiCheckCircle size={40} className="text-vault-success" />
        </div>
        <div>
          <h1 className="text-h1 font-bold text-vault-text">Order confirmed!</h1>
          <p className="mt-1 text-body text-vault-text-secondary">
            Your payment cleared and escrow contracts were created.
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-vault-lg border border-vault-border bg-vault-surface overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-vault-border">
          <p className="text-overline uppercase text-vault-text-tertiary">Items ordered</p>
        </div>
        <div className="divide-y divide-vault-border">
          {payload.orders.map((order, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 text-body">
              <span className="text-vault-text">{order.name}</span>
              <span className="text-vault-text-secondary">×{order.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 bg-vault-inset border-t border-vault-border">
          <span className="text-body text-vault-text-secondary">Total paid</span>
          <span className="font-bold text-vault-text">{totalFormatted}</span>
        </div>
      </div>

      {/* Transactions */}
      {payload.txs.length > 0 && (
        <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-3 mb-4">
          <p className="text-overline uppercase text-vault-text-tertiary">
            Transaction{payload.txs.length > 1 ? "s" : ""}
          </p>
          {payload.txs.map((tx) => (
            <a
              key={tx}
              href={CONFIG.ETHERSCAN_TX_BASE_URL ? `${CONFIG.ETHERSCAN_TX_BASE_URL}/${tx}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-caption text-vault-text-secondary hover:text-vault-accent transition-colors break-all group"
            >
              <FiExternalLink size={12} className="shrink-0 group-hover:text-vault-accent" />
              {tx}
            </a>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/orders"
          className="flex items-center justify-center gap-2 bg-vault-accent text-vault-on-accent font-semibold py-3 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow text-body"
        >
          My orders <FiArrowRight size={14} />
        </Link>
        <Link
          href="/stores"
          className="flex items-center justify-center gap-2 border border-vault-border text-vault-text font-semibold py-3 rounded-vault-md hover:border-vault-border-accent hover:bg-vault-surface transition-all text-body"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
