"use client";

import { disputesService } from "@/api";
import { IDispute } from "@/api/interfaces/disputes";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Skeleton from "@/components/ui/skeleton";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const statusLabel: Record<string, string> = {
  fee_pending: "Awaiting arbitration fees",
  arbitrating: "Under arbitration",
  resolved: "Resolved",
  timed_out: "Timed out",
};

export default function SellerDisputesPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [disputes, setDisputes] = useState<IDispute[] | null>(null);

  const load = async () => {
    const response = await disputesService.getDisputes();
    setDisputes(response.data);
  };

  useEffect(() => {
    if (auth.isLoggedIn) {
      load();
    }
  }, [auth.isLoggedIn]);

  if (!disputes) {
    return (
      <div className="space-y-3">
        <Skeleton h={180} />
        <Skeleton h={180} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Disputes</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Disputes are resolved on-chain via arbitration. Use the dispute page to pay fees, submit evidence, or invoke a timeout.
        </p>
      </div>

      {disputes.length === 0 ? (
        <EmptyState title="No disputes" description="On-chain disputes will appear here once raised." />
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.ID} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">Order {String(dispute.OrderID).slice(0, 8)}…</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {statusLabel[dispute.Status] ?? dispute.Status}
                  </p>
                  {dispute.Ruling !== null ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      Ruling:{" "}
                      {dispute.Ruling === 1
                        ? "Buyer wins"
                        : dispute.Ruling === 2
                        ? "Receiver wins"
                        : "Refused"}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/orders/${dispute.OrderID}/dispute`}
                  className="shrink-0 rounded-md border border-border-subtle px-3 py-1.5 text-sm hover:bg-bg-secondary"
                >
                  View dispute
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
