"use client";

import { disputesService } from "@/api";
import { IDispute } from "@/api/interfaces/disputes";
import { IOrder } from "@/api/interfaces/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import { connect } from "react-redux";

const STATUS_LABELS: Record<string, string> = {
  fee_pending: "Awaiting arbitration fee",
  arbitrating: "Under arbitration",
  resolved: "Resolved",
  timed_out: "Timed out",
};

const OpenDispute = (props: any) => {
  const order: IOrder = props.order;
  const [dispute, setDispute] = useState<IDispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!props.auth.user) {
      window.location.href = "/auth/login";
      return;
    }
    disputesService
      .getDisputeByOrderID(order?.ID)
      .then((res) => {
        if (res.status === 200) {
          setDispute(res.data);
          props.setDispute?.(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [order?.ID]);

  return (
    <div className="flex w-full flex-col h-full pl-4 space-y-3">
      <h2 className="text-3xl">Order Details</h2>
      <p className="text-xl">Status: {order?.Status}</p>
      <p className="text-xl">Total: {order?.Total}</p>

      {loading ? (
        <p className="text-text-secondary">Loading dispute…</p>
      ) : dispute ? (
        <div className="space-y-2 rounded-lg border border-border-subtle bg-bg-secondary p-4">
          <p className="font-semibold">
            Dispute status:{" "}
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
            className="inline-block mt-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Manage dispute
          </Link>
        </div>
      ) : (
        <Link
          href={`/orders/${order.ID}/dispute`}
          className="inline-block bg-bg-secondary border border-border-subtle text-sm font-semibold px-4 py-2 rounded-lg hover:border-primary transition-colors"
        >
          View / raise dispute
        </Link>
      )}
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(OpenDispute);
