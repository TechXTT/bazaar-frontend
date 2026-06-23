"use client";

import { disputesService } from "@/api";
import { IDispute } from "@/api/interfaces/disputes";
import { CONFIG } from "@/config/config";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FiArrowRight,
  FiExternalLink,
  FiShield,
} from "react-icons/fi";
import { disputeStatusConfig, rulingLabel } from "@/utils/disputes";

/** Per-status card border styling specific to this page. */
const STATUS_BORDER: Record<string, string> = {
  fee_pending: "border-vault-warning/30",
  arbitrating: "border-vault-warning/30",
  resolved:    "border-vault-success/30",
  timed_out:   "border-vault-border",
};

export default function SellerDisputesPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [disputes, setDisputes] = useState<IDispute[] | null>(null);

  useEffect(() => {
    if (auth.isLoggedIn) {
      disputesService
        .getDisputes()
        .then((res) => setDisputes(res.data))
        .catch(() => setDisputes([]));
    }
  }, [auth.isLoggedIn]);

  if (!disputes) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-vault-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-vault-text">Disputes</h1>
        <p className="mt-1 text-body text-vault-text-secondary">
          On-chain disputes resolved via Kleros arbitration.
        </p>
      </div>

      {disputes.length === 0 ? (
        <EmptyState
          icon={<FiShield size={24} />}
          title="No disputes"
          description="On-chain disputes will appear here once raised."
        />
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => {
            const cfg = disputeStatusConfig(dispute.Status);
            const border = STATUS_BORDER[dispute.Status] ?? "border-vault-border";
            return (
              <div
                key={dispute.ID}
                className={`rounded-vault-lg border bg-vault-surface p-5 space-y-3 ${border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <cfg.Icon size={15} className={cfg.className} />
                      <span className={`text-body-strong ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <p className="text-body text-vault-text-secondary">
                      Order{" "}
                      <span className="font-mono text-caption text-vault-text">
                        {String(dispute.OrderID).slice(0, 8)}…
                      </span>
                    </p>
                    {dispute.ArbitratorDisputeID !== null && (
                      <a
                        href={`${CONFIG.KLEROS_COURT_URL}/cases/${dispute.ArbitratorDisputeID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-caption text-vault-accent hover:underline"
                      >
                        Kleros #{dispute.ArbitratorDisputeID} <FiExternalLink size={10} />
                      </a>
                    )}
                    {dispute.Ruling !== null && (
                      <p className="text-caption text-vault-text-tertiary">
                        Ruling:{" "}
                        <span className="text-vault-text font-medium">
                          {rulingLabel(dispute.Ruling)}
                        </span>
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/orders/${dispute.OrderID}/dispute`}
                    className="inline-flex items-center gap-1.5 border border-vault-border text-body font-semibold px-3 py-2 rounded-vault-md text-vault-text hover:border-vault-border-accent hover:text-vault-accent transition-all shrink-0"
                  >
                    Manage <FiArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
