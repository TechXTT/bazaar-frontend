"use client";

import { ORDER_FILTERS, productsService } from "@/api";
import EmptyState from "@/components/ui/empty-state";
import Skeleton from "@/components/ui/skeleton";
import { IOrder } from "@/api/interfaces/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Card from "@/components/ui/card";

export default function OrdersPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<IOrder[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await productsService.getOrders(auth.jwt || "", ORDER_FILTERS.buyer);
      setOrders(response.data);
    };

    if (auth.isLoggedIn) {
      load();
    }
  }, [auth.isLoggedIn, auth.jwt]);

  if (!orders) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <Skeleton h={92} />
          <Skeleton h={92} />
          <Skeleton h={92} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-32 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Your orders</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Track purchases, disputes, and escrow release status.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your paid orders will appear here after checkout."
          action={<Link href="/stores" className="underline">Browse stores</Link>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.ID} href={`/orders/${order.ID}`}>
              <Card className="flex flex-col gap-3 transition hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{order.Quantity} x {order.Product.Name}</p>
                  <p className="text-sm text-text-secondary">
                    Status: {order.Status} • Total: {order.Total} {order.Product.Unit}
                  </p>
                </div>
                <span className="text-sm text-text-secondary">View order</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
