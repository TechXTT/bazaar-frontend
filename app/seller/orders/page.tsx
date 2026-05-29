"use client";

import { ORDER_FILTERS, productsService } from "@/api";
import { claimOrder, claimOrders, getEscrowOrder } from "@/components/escrow";
import { IOrder } from "@/api/interfaces/products";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FiAlertCircle, FiArrowRight, FiClock, FiDollarSign, FiPackage } from "react-icons/fi";

type EscrowMeta = { claimable: boolean; releaseTime: bigint };

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  created:   { label: "Pending",   className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  completed: { label: "Completed", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  released:  { label: "Released",  className: "bg-green-500/15 text-green-400 border-green-500/20" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/20" },
  disputed:  { label: "Disputed",  className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
};

function formatRemaining(releaseTime: bigint, now: number): string {
  const diffMs = Number(releaseTime) * 1000 - now;
  if (diffMs <= 0) return "Claim now";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `${days}d ${remHours}h remaining`;
}

export default function SellerOrdersPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<IOrder[] | null>(null);
  const [meta, setMeta] = useState<Record<string, EscrowMeta>>({});
  const [now, setNow] = useState(Date.now());
  const [pendingId, setPendingId] = useState("");

  const load = async () => {
    const response = await productsService.getOrders(ORDER_FILTERS.seller);
    setOrders(response.data);
    const entries = await Promise.all(
      response.data.map(async (order) => {
        try {
          const eo = await getEscrowOrder(order.ID);
          const claimable =
            !eo.completed && (eo.release || Number(eo.releaseTime) * 1000 <= Date.now());
          return [order.ID, { claimable, releaseTime: eo.releaseTime }] as const;
        } catch {
          return [order.ID, { claimable: false, releaseTime: BigInt(0) }] as const;
        }
      })
    );
    setMeta(Object.fromEntries(entries));
  };

  useEffect(() => {
    if (auth.isLoggedIn) load();
  }, [auth.isLoggedIn, auth.jwt]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const claimableIds = useMemo(
    () => (orders ?? []).filter((o) => meta[o.ID]?.claimable).map((o) => o.ID),
    [meta, orders]
  );

  if (!orders) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders received</h1>
          <p className="mt-1 text-sm text-text-secondary">Payout and dispute management.</p>
        </div>
        {claimableIds.length > 1 && (
          <button
            disabled={pendingId === "all"}
            onClick={async () => {
              setPendingId("all");
              await claimOrders(claimableIds);
              setPendingId("");
              await load();
            }}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm disabled:opacity-50"
          >
            {pendingId === "all" ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <FiDollarSign size={14} />
            )}
            Withdraw all ({claimableIds.length})
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border-subtle space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary border border-border-subtle">
            <FiPackage size={24} className="text-text-muted" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-white">No orders received</p>
            <p className="text-sm text-text-secondary">Paid orders for your stores will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const orderMeta = meta[order.ID];
            const canClaim = orderMeta?.claimable;
            const statusCfg = STATUS_CONFIG[order.Status?.toLowerCase()] ?? {
              label: order.Status,
              className: "bg-bg-secondary text-text-secondary border-border-subtle",
            };
            const date = order.CreatedAt
              ? new Date(order.CreatedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })
              : null;

            return (
              <div
                key={order.ID}
                className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken border border-border-subtle">
                  <FiPackage size={18} className="text-text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{order.Product.Name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Qty {order.Quantity} · {order.Total?.toFixed(4)} {order.Product.Unit}
                    {date && ` · ${date}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.className}`}
                  >
                    {statusCfg.label}
                  </span>

                  {order.Status !== "cancelled" && (
                    canClaim ? (
                      <button
                        disabled={pendingId === order.ID}
                        onClick={async () => {
                          setPendingId(order.ID);
                          await claimOrder(order.ID);
                          setPendingId("");
                          await load();
                        }}
                        className="inline-flex items-center gap-1.5 bg-primary text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {pendingId === order.ID ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <FiDollarSign size={12} />
                        )}
                        Claim
                      </button>
                    ) : order.Status === "disputed" ? (
                      <Link
                        href="/seller/disputes"
                        className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:underline font-medium"
                      >
                        <FiAlertCircle size={12} /> Resolve
                      </Link>
                    ) : orderMeta ? (
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                        <FiClock size={11} />
                        {formatRemaining(orderMeta.releaseTime, now)}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">Checking…</span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
