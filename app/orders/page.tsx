"use client";

import { ORDER_FILTERS, productsService } from "@/api";
import { IOrder } from "@/api/interfaces/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import OrderStatusBadge from "@/components/ui/order-status-badge";
import WithdrawBanner from "@/components/ui/withdraw-banner";

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
        <div className="h-8 w-40 rounded-lg bg-vault-surface animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-vault-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <WithdrawBanner className="mb-8" />
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        {orders.length > 0 && (
          <span className="text-sm font-medium text-vault-text-tertiary bg-vault-surface border border-vault-border rounded-full px-2.5 py-0.5">
            {orders.length}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-24 space-y-5 rounded-2xl border border-dashed border-vault-border overflow-hidden text-center">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #8b7dff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-full bg-vault-accent/18 blur-[70px]" />
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-vault-accent/10 border border-vault-accent/20 text-vault-accent shadow-lg shadow-vault-accent/10">
            <FiPackage size={28} />
          </div>
          <div className="relative space-y-1 text-center">
            <p className="font-semibold text-white text-lg">No orders yet</p>
            <p className="text-sm text-vault-text-secondary max-w-xs mx-auto">
              Your paid orders will appear here after checkout.
            </p>
          </div>
          <Link
            href="/stores"
            className="relative inline-flex items-center gap-2 bg-vault-accent text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-vault-accent/30 text-sm"
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
                className="group flex items-center gap-4 rounded-vault-lg border border-vault-border bg-vault-surface p-4 transition-all hover:border-vault-border-accent hover:shadow-vault-card"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vault-md border border-vault-border bg-vault-inset">
                  <FiPackage size={18} className="text-vault-text-tertiary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-white">{order.Product.Name}</p>
                  <p className="text-xs text-vault-text-tertiary mt-0.5">
                    Qty {order.Quantity} · {order.Total?.toFixed(4)} {order.Product.Unit}
                    {date && ` · ${date}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <OrderStatusBadge status={order.Status} />
                  <FiArrowRight
                    size={14}
                    className="text-vault-text-tertiary group-hover:text-vault-accent transition-colors"
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
