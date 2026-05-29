"use client";

import { productsService } from "@/api";
import { IOrder } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import OpenDispute from "../components/openDispute";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  created: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  released: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  disputed: "bg-yellow-500/20 text-yellow-400",
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    productsService
      .getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <p className="text-text-secondary">Could not load order.</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-bg-secondary" />
        <div className="h-64 rounded-lg bg-bg-secondary" />
        <div className="h-6 w-64 rounded bg-bg-secondary" />
        <div className="h-6 w-40 rounded bg-bg-secondary" />
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[order.Status?.toLowerCase()] ?? "bg-bg-secondary text-text-secondary";
  const createdAt = order.CreatedAt ? new Date(order.CreatedAt).toLocaleDateString() : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Order detail</h1>
        {order.Status && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle}`}>
            {order.Status}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Product info */}
        <div className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden">
          {order.Product?.ImageURL && (
            <BucketImage
              key={order.Product.ID}
              imageURL={order.Product.ImageURL}
              name={order.Product.Name}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-4 space-y-2">
            <Link
              href={`/products/${order.Product?.ID}`}
              className="text-xl font-bold hover:underline"
            >
              {order.Product?.Name}
            </Link>
            {order.Product?.Store && (
              <p className="text-sm text-text-secondary">
                Sold by{" "}
                <Link
                  href={`/stores/${order.Product.StoreID}`}
                  className="hover:underline text-primary"
                >
                  {order.Product.Store.Name}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Order metadata + dispute */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Quantity</span>
              <span className="font-medium">{order.Quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Unit price</span>
              <span className="font-medium">
                {order.Product?.Price?.toFixed(4)} {order.Product?.Unit}
              </span>
            </div>
            <div className="border-t border-border-subtle pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>{order.Total?.toFixed(4)}</span>
            </div>
            {createdAt && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Placed on</span>
                <span>{createdAt}</span>
              </div>
            )}
          </div>

          <OpenDispute order={order} />
        </div>
      </div>
    </div>
  );
}
