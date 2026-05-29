"use client";

import { disputesService } from "@/api";
import { IDispute } from "@/api/interfaces/disputes";
import { IOrder } from "@/api/interfaces/products";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const STATUS_LABELS: Record<string, string> = {
  fee_pending: "Awaiting arbitration fee",
  arbitrating: "Under arbitration",
  resolved: "Resolved",
  timed_out: "Timed out",
};

const OpenDispute = ({ order }: { order: IOrder }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [dispute, setDispute] = useState<IDispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.user) {
      router.replace("/auth/login");
      return;
    }
    disputesService
      .getDisputeByOrderID(order?.ID)
      .then((res) => {
        if (res.status === 200) setDispute(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [order?.ID, auth.user]);

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-text-secondary">Loading dispute…</p>
      ) : dispute ? (
        <div className="rounded-lg border border-border-subtle bg-bg-secondary p-4 space-y-2">
          <p className="text-sm font-semibold">
            Dispute:{" "}
            <span className="font-normal">{STATUS_LABELS[dispute.Status] ?? dispute.Status}</span>
          </p>
          {dispute.Ruling !== null && (
            <p className="text-sm text-text-secondary">
              Ruling:{" "}
              {dispute.Ruling === 1
                ? "Buyer wins"
                : dispute.Ruling === 2
                ? "Seller wins"
                : "Refused to arbitrate"}
            </p>
          )}
          <Link
            href={`/orders/${order.ID}/dispute`}
            className="inline-block mt-1 text-sm font-semibold text-primary hover:underline"
          >
            Manage dispute →
          </Link>
        </div>
      ) : (
        <Link
          href={`/orders/${order.ID}/dispute`}
          className="inline-block text-sm font-semibold border border-border-subtle rounded-lg px-4 py-2 hover:border-primary transition-colors"
        >
          View / raise dispute
        </Link>
      )}
    </div>
  );
};

export default OpenDispute;
