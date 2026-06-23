"use client";

import { productsService } from "@/api";
import { IOrder } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import OpenDispute from "../components/openDispute";
import { buyerReclaim, confirmReceipt, getEscrowOrder } from "@/components/escrow";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiHash, FiPackage, FiRotateCcw } from "react-icons/fi";
import OrderStatusBadge from "@/components/ui/order-status-badge";
import Stepper from "@/components/ui/stepper";

type BuyerEscrowMeta = { onChain: boolean; shipped: boolean; completed: boolean; shippingDeadline: bigint };

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState(false);
  const [escrow, setEscrow] = useState<BuyerEscrowMeta | null>(null);
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(Date.now());

  const loadOrder = () =>
    productsService
      .getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => setError(true));

  useEffect(() => {
    loadOrder();
  }, [id]);

  useEffect(() => {
    let active = true;
    getEscrowOrder(id)
      .then((eo) => {
        if (!active) return;
        const onChain =
          eo.receiver !== "0x0000000000000000000000000000000000000000" &&
          Number(eo.releaseTime) > 0;
        setEscrow({
          onChain,
          shipped: eo.shipped,
          completed: eo.completed,
          shippingDeadline: eo.shippingDeadline,
        });
      })
      .catch(() => {
        if (active) setEscrow(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const reload = async () => {
    await loadOrder();
    try {
      const eo = await getEscrowOrder(id);
      const onChain =
        eo.receiver !== "0x0000000000000000000000000000000000000000" &&
        Number(eo.releaseTime) > 0;
      setEscrow({
        onChain,
        shipped: eo.shipped,
        completed: eo.completed,
        shippingDeadline: eo.shippingDeadline,
      });
    } catch {
      setEscrow(null);
    }
  };

  const canConfirm = !!escrow && escrow.onChain && escrow.shipped && !escrow.completed;
  const canReclaim =
    !!escrow &&
    escrow.onChain &&
    !escrow.shipped &&
    !escrow.completed &&
    Number(escrow.shippingDeadline) > 0 &&
    Number(escrow.shippingDeadline) * 1000 <= now;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-center space-y-2">
          <p className="font-semibold text-white">Order not found</p>
          <p className="text-sm text-vault-text-secondary">This order may no longer be available.</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-vault-accent hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-5 w-24 rounded bg-vault-surface animate-pulse mb-8" />
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="aspect-[4/3] rounded-2xl bg-vault-surface animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-1/2 rounded bg-vault-surface animate-pulse" />
            <div className="h-40 rounded-2xl bg-vault-surface animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const createdAt = order.CreatedAt
    ? new Date(order.CreatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-vault-text-secondary hover:text-white transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> My orders
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Order detail</h1>
        {order.Status && <OrderStatusBadge status={order.Status} size="md" />}
      </div>

      {/* Escrow lifecycle tracking */}
      <div className="mb-8 overflow-x-auto rounded-vault-lg border border-vault-border bg-vault-surface p-5">
        <Stepper status={order.Status} />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Product card */}
        <div className="rounded-2xl border border-vault-border bg-vault-surface overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden">
            <BucketImage
              key={order.Product.ID}
              imageURL={order.Product.ImageURL}
              name={order.Product.Name}
              className="h-full w-full"
            />
          </div>
          <div className="p-5 space-y-2">
            <Link
              href={`/products/${order.Product?.ID}`}
              className="text-xl font-bold hover:text-vault-accent transition-colors"
            >
              {order.Product?.Name}
            </Link>
            {order.Product?.Store && (
              <p className="text-sm text-vault-text-secondary">
                Sold by{" "}
                <Link
                  href={`/stores/${order.Product.StoreID}`}
                  className="text-vault-accent hover:underline"
                >
                  {order.Product.Store.Name}
                </Link>
              </p>
            )}
            {order.Product?.Description && (
              <p className="text-sm text-vault-text-tertiary leading-relaxed pt-3 border-t border-vault-border">
                {order.Product.Description}
              </p>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Order summary */}
          <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-vault-text-tertiary">
              Order summary
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-vault-text-secondary flex items-center gap-1.5">
                  <FiPackage size={13} /> Quantity
                </span>
                <span className="font-medium text-white">×{order.Quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-vault-text-secondary">Unit price</span>
                <span className="font-medium text-white">
                  {order.Product?.Price?.toFixed(4)} {order.Product?.Unit}
                </span>
              </div>
              <div className="border-t border-vault-border pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-white text-lg">
                  {order.Total?.toFixed(4)} {order.Product?.Unit}
                </span>
              </div>
              {createdAt && (
                <div className="flex justify-between text-sm border-t border-vault-border pt-3">
                  <span className="text-vault-text-secondary flex items-center gap-1.5">
                    <FiCalendar size={13} /> Placed on
                  </span>
                  <span className="text-white">{createdAt}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-vault-text-secondary flex items-center gap-1.5">
                  <FiHash size={13} /> Order ID
                </span>
                <span className="font-mono text-xs text-vault-text-tertiary">
                  {String(order.ID).slice(0, 8)}…
                </span>
              </div>
            </div>
          </div>

          {/* Shipment actions */}
          {(canConfirm || canReclaim) && (
            <div className="rounded-2xl border border-vault-border bg-vault-surface p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-vault-text-tertiary">
                Shipment
              </p>
              {canConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-vault-text-secondary">
                    The seller marked this order as shipped. Confirm receipt to release
                    the escrowed funds.
                  </p>
                  <button
                    disabled={pending}
                    onClick={async () => {
                      setPending(true);
                      try {
                        await confirmReceipt(order.ID);
                        await reload();
                      } finally {
                        setPending(false);
                      }
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 bg-vault-accent text-vault-on-accent font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {pending ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FiCheckCircle size={14} />
                    )}
                    Confirm receipt
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-vault-text-secondary">
                    The seller didn&apos;t ship before the deadline. You can reclaim your
                    full payment.
                  </p>
                  <button
                    disabled={pending}
                    onClick={async () => {
                      setPending(true);
                      try {
                        await buyerReclaim(order.ID);
                        await reload();
                      } finally {
                        setPending(false);
                      }
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 bg-vault-accent text-vault-on-accent font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {pending ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FiRotateCcw size={14} />
                    )}
                    Reclaim funds
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dispute */}
          <OpenDispute order={order} />
        </div>
      </div>
    </div>
  );
}
