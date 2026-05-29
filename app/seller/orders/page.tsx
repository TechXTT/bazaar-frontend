"use client";

import { ORDER_FILTERS, productsService } from "@/api";
import { claimOrder, claimOrders, getEscrowOrder } from "@/components/escrow";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Skeleton from "@/components/ui/skeleton";
import { IOrder } from "@/api/interfaces/products";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

type EscrowMeta = {
  claimable: boolean;
  releaseTime: bigint;
};

const formatRemaining = (releaseTime: bigint, now: number) => {
  const diffMs = Number(releaseTime) * 1000 - now;
  if (diffMs <= 0) return "Claim now";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return `Claimable in ${days}d ${remHours}h`;
};

export default function SellerOrdersPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<IOrder[] | null>(null);
  const [meta, setMeta] = useState<Record<string, EscrowMeta>>({});
  const [now, setNow] = useState(Date.now());
  const [pendingId, setPendingId] = useState("");

  const load = async () => {
    const response = await productsService.getOrders(ORDER_FILTERS.seller);
    setOrders(response.data);

    const detailEntries = await Promise.all(
      response.data.map(async (order) => {
        try {
          const escrowOrder = await getEscrowOrder(order.ID);
          const claimable =
            !escrowOrder.completed &&
            (escrowOrder.release || Number(escrowOrder.releaseTime) * 1000 <= Date.now());
          return [order.ID, { claimable, releaseTime: escrowOrder.releaseTime }] as const;
        } catch {
          return [order.ID, { claimable: false, releaseTime: BigInt(0) }] as const;
        }
      })
    );

    setMeta(Object.fromEntries(detailEntries));
  };

  useEffect(() => {
    if (auth.isLoggedIn) {
      load();
    }
  }, [auth.isLoggedIn, auth.jwt]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const claimableIds = useMemo(
    () => (orders || []).filter((order) => meta[order.ID]?.claimable).map((order) => order.ID),
    [meta, orders]
  );

  if (!orders) {
    return (
      <div className="space-y-3">
        <Skeleton h={96} />
        <Skeleton h={96} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders received</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Seller-side order payouts and disputes.
          </p>
        </div>
        {claimableIds.length > 1 ? (
          <Button
            isLoading={pendingId === "all"}
            onClick={async () => {
              setPendingId("all");
              await claimOrders(claimableIds);
              setPendingId("");
              await load();
            }}
          >
            Withdraw all
          </Button>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No incoming orders" description="Paid orders for your stores will appear here." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const orderMeta = meta[order.ID];
            const canClaim = orderMeta?.claimable;

            return (
              <Card key={order.ID} className="space-y-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-semibold">{order.Product.Name}</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Order {String(order.ID).slice(0, 8)} • Qty {order.Quantity} • Status {order.Status}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                    {order.Status === "cancelled" ? null : canClaim ? (
                      <Button
                        isLoading={pendingId === order.ID}
                        onClick={async () => {
                          setPendingId(order.ID);
                          await claimOrder(order.ID);
                          setPendingId("");
                          await load();
                        }}
                      >
                        Claim
                      </Button>
                    ) : order.Status === "disputed" ? (
                      <Link href="/seller/disputes" className="underline text-sm">
                        Resolve dispute
                      </Link>
                    ) : (
                      <span className="text-sm text-text-secondary">
                        {orderMeta ? formatRemaining(orderMeta.releaseTime, now) : "Checking escrow"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
