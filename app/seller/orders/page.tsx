"use client";

import { keccak256, toUtf8Bytes } from "ethers";
import { ORDER_FILTERS, productsService } from "@/api";
import { claimOrder, claimOrders, getEscrowOrder, markShipped } from "@/components/escrow";
import { IOrder } from "@/api/interfaces/products";
import { CONFIG } from "@/config/config";
import { RootState } from "@/redux/store";
import { formatFeeBps, sellerNetFraction } from "@/utils/helpers";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FiAlertCircle, FiClock, FiDollarSign, FiPackage, FiTruck } from "react-icons/fi";
import OrderStatusBadge from "@/components/ui/order-status-badge";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";

const FEE_LABEL = formatFeeBps(CONFIG.PLATFORM_FEE_BPS);
const NET_FRACTION = sellerNetFraction(CONFIG.PLATFORM_FEE_BPS);

type EscrowMeta = { claimable: boolean; onChain: boolean; shipped: boolean; releaseTime: bigint };

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
  // FE-14: inline shipping form (replaces window.prompt). Holds the order whose
  // tracking form is open and the current tracking-reference input.
  const [shippingFor, setShippingFor] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const submitShipment = async (orderId: string) => {
    const trimmed = trackingInput.trim();
    const trackingHash = trimmed ? keccak256(toUtf8Bytes(trimmed)) : undefined;
    setShippingFor(null);
    setTrackingInput("");
    setPendingId(orderId);
    await markShipped(orderId, trackingHash);
    setPendingId("");
    await load();
  };

  const load = async () => {
    const response = await productsService.getOrders(ORDER_FILTERS.seller);
    setOrders(response.data);
    const entries = await Promise.all(
      response.data.map(async (order) => {
        try {
          const eo = await getEscrowOrder(order.ID);
          // The contract's `orders` mapping returns an all-zero struct (no revert)
          // for orders that were never created on-chain, which would otherwise read
          // as releaseTime=0 → "past release" → falsely claimable. Only treat an
          // order as on-chain (and thus potentially claimable) when it actually exists.
          const onChain =
            eo.receiver !== "0x0000000000000000000000000000000000000000" &&
            Number(eo.releaseTime) > 0;
          const claimable =
            onChain &&
            !eo.completed &&
            (eo.release || Number(eo.releaseTime) * 1000 <= Date.now());
          return [order.ID, { claimable, onChain, shipped: eo.shipped, releaseTime: eo.releaseTime }] as const;
        } catch {
          return [order.ID, { claimable: false, onChain: false, shipped: false, releaseTime: BigInt(0) }] as const;
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
          <Skeleton key={i} className="h-20 rounded-vault-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-vault-text">Orders received</h1>
          <p className="mt-1 text-body text-vault-text-secondary">
            Payout and dispute management. A {FEE_LABEL} protocol fee is deducted from each payout.
          </p>
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
            className="inline-flex items-center gap-2 bg-vault-accent text-vault-on-accent font-semibold px-4 py-2.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow text-body disabled:opacity-50"
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
        <EmptyState
          icon={<FiPackage size={28} />}
          title="No orders received"
          description="Paid orders for your stores will appear here."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const orderMeta = meta[order.ID];
            const canClaim = orderMeta?.claimable;
            const canShip =
              orderMeta?.onChain &&
              !orderMeta.shipped &&
              !orderMeta.claimable &&
              order.Status !== "completed" &&
              order.Status !== "cancelled" &&
              order.Status !== "disputed";
            const date = order.CreatedAt
              ? new Date(order.CreatedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })
              : null;

            return (
              <div
                key={order.ID}
                className="flex items-center gap-4 rounded-vault-lg border border-vault-border bg-vault-surface p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vault-md bg-vault-inset border border-vault-border">
                  <FiPackage size={18} className="text-vault-text-tertiary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-vault-text truncate">{order.Product.Name}</p>
                  <p className="text-caption text-vault-text-tertiary mt-0.5">
                    Qty {order.Quantity} · {order.Total?.toFixed(4)} {order.Product.Unit}
                    {date && ` · ${date}`}
                  </p>
                  {canClaim && order.Total != null && (
                    <p className="mt-0.5 text-caption text-vault-text-secondary">
                      You receive{" "}
                      <span className="font-medium text-vault-text">
                        {(order.Total * NET_FRACTION).toFixed(4)} {order.Product.Unit}
                      </span>{" "}
                      after the {FEE_LABEL} fee
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <OrderStatusBadge status={order.Status} />

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
                        className="inline-flex items-center gap-1.5 bg-vault-accent text-vault-on-accent font-semibold text-label px-3 py-1.5 rounded-vault hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {pendingId === order.ID ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <FiDollarSign size={12} />
                        )}
                        Claim
                      </button>
                    ) : canShip ? (
                      shippingFor === order.ID ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            void submitShipment(order.ID);
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <label htmlFor={`tracking-${order.ID}`} className="sr-only">
                            Tracking reference (optional)
                          </label>
                          <input
                            id={`tracking-${order.ID}`}
                            autoFocus
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setShippingFor(null);
                                setTrackingInput("");
                              }
                            }}
                            placeholder="Tracking ref (optional)"
                            className="h-8 w-40 rounded-vault border border-vault-border bg-vault-inset px-2 text-label text-vault-text focus:border-vault-border-accent focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 bg-vault-accent text-vault-on-accent font-semibold text-label px-2.5 py-1.5 rounded-vault hover:opacity-90 transition-opacity"
                          >
                            <FiTruck size={12} /> Ship
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShippingFor(null);
                              setTrackingInput("");
                            }}
                            className="text-label text-vault-text-tertiary hover:text-vault-text px-1"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          disabled={pendingId === order.ID}
                          onClick={() => {
                            setShippingFor(order.ID);
                            setTrackingInput("");
                          }}
                          className="inline-flex items-center gap-1.5 bg-vault-accent text-vault-on-accent font-semibold text-label px-3 py-1.5 rounded-vault hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {pendingId === order.ID ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <FiTruck size={12} />
                          )}
                          Mark as shipped
                        </button>
                      )
                    ) : order.Status === "disputed" ? (
                      <Link
                        href="/seller/disputes"
                        className="inline-flex items-center gap-1 text-label text-vault-warning hover:underline font-medium"
                      >
                        <FiAlertCircle size={12} /> Resolve
                      </Link>
                    ) : !orderMeta ? (
                      <span className="text-label text-vault-text-tertiary">Checking…</span>
                    ) : !orderMeta.onChain ? (
                      <span className="inline-flex items-center gap-1 text-label text-vault-text-tertiary">
                        <FiClock size={11} /> Awaiting payment
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-label text-vault-text-tertiary">
                        <FiClock size={11} />
                        {formatRemaining(orderMeta.releaseTime, now)}
                      </span>
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
