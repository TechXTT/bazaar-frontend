"use client";

import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import { CONFIG } from "@/config/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TbCircleCheckFilled } from "react-icons/tb";

type ConfirmationOrder = {
  name: string;
  quantity: number;
};

type ConfirmationPayload = {
  orders: ConfirmationOrder[];
  timestamp: number;
  total: number;
  txs: string[];
};

const STORAGE_KEY = "bazaar.checkout.confirmation";

export default function CartConfirmationPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<ConfirmationPayload | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/orders");
      return;
    }

    setPayload(JSON.parse(raw));

    return () => {
      window.sessionStorage.removeItem(STORAGE_KEY);
    };
  }, [router]);

  if (!payload) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-32">
        <EmptyState
          icon={<TbCircleCheckFilled className="h-10 w-10" />}
          title="No checkout summary"
          description="Your checkout summary is only available right after a successful payment."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-32 sm:px-6 lg:px-8">
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <TbCircleCheckFilled className="h-10 w-10 text-status-success" />
          <div>
            <h1 className="text-2xl font-semibold">Checkout complete</h1>
            <p className="text-sm text-text-secondary">
              Your payment cleared and the order records were created.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {payload.orders.map((order, index) => (
            <div
              key={`${order.name}-${index}`}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-sunken px-4 py-3"
            >
              <span>{order.name}</span>
              <span className="text-text-secondary">x{order.quantity}</span>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-border-subtle bg-surface-sunken p-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Total paid</span>
            <span className="font-semibold">{payload.total.toFixed(4)} ETH</span>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {payload.txs.map((tx) => (
              <a
                key={tx}
                className="block break-all text-text-secondary underline"
                href={CONFIG.ETHERSCAN_TX_BASE_URL ? `${CONFIG.ETHERSCAN_TX_BASE_URL}/${tx}` : undefined}
                target="_blank"
              >
                {tx}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/orders" className="sm:flex-1">
            <Button className="w-full">View your orders</Button>
          </Link>
          <Link href="/stores" className="sm:flex-1">
            <Button className="w-full" variant="secondary">
              Keep shopping
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
