"use client";

import { ORDER_FILTERS, productsService } from "@/api";
import { IOrder } from "@/api/interfaces/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FiArrowRight, FiPackage } from "react-icons/fi";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  created:   { label: "Pending",   className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  completed: { label: "Completed", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  released:  { label: "Released",  className: "bg-green-500/15 text-green-400 border-green-500/20" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/20" },
  disputed:  { label: "Disputed",  className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status,
    className: "bg-bg-secondary text-text-secondary border-border-subtle",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<IOrder[] | null>(null);

  useEffect(() => {
    if (auth.isLoggedIn) {
      productsService
        .getOrders(ORDER_FILTERS.buyer)
        .then((res) => setOrders(res.data))
        .catch(() => setOrders([]));
    }
  }, [auth.isLoggedIn, auth.jwt]);

  if (!orders) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-8 w-40 rounded-lg bg-bg-secondary animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        {orders.length > 0 && (
          <span className="text-sm font-medium text-text-muted bg-bg-secondary border border-border-subtle rounded-full px-2.5 py-0.5">
            {orders.length}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-24 space-y-5 rounded-2xl border border-dashed border-border-subtle overflow-hidden text-center">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-full bg-primary/18 blur-[70px]" />
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10">
            <FiPackage size={28} />
          </div>
          <div className="relative space-y-1 text-center">
            <p className="font-semibold text-white text-lg">No orders yet</p>
            <p className="text-sm text-text-secondary max-w-xs mx-auto">
              Your paid orders will appear here after checkout.
            </p>
          </div>
          <Link
            href="/stores"
            className="relative inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30 text-sm"
          >
            Browse stores <FiArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const date = order.CreatedAt
              ? new Date(order.CreatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;
            return (
              <Link
                key={order.ID}
                href={`/orders/${order.ID}`}
                className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-4 hover:border-primary transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken border border-border-subtle">
                  <FiPackage size={18} className="text-text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-white">{order.Product.Name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Qty {order.Quantity} · {order.Total?.toFixed(4)} {order.Product.Unit}
                    {date && ` · ${date}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={order.Status} />
                  <FiArrowRight
                    size={14}
                    className="text-text-muted group-hover:text-primary transition-colors"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
