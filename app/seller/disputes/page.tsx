"use client";

import { disputesService } from "@/api";
import { IDispute } from "@/api/interfaces/disputes";
import { CONFIG } from "@/config/config";
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
  fee_pending: "border-yellow-500/20",
  arbitrating: "border-orange-500/20",
  resolved:    "border-green-500/20",
  timed_out:   "border-border-subtle",
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
          <div key={i} className="h-28 rounded-2xl bg-bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disputes</h1>
        <p className="mt-1 text-sm text-text-secondary">
          On-chain disputes resolved via Kleros arbitration.
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border-subtle space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary border border-border-subtle">
            <FiShield size={24} className="text-text-muted" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-white">No disputes</p>
            <p className="text-sm text-text-secondary">On-chain disputes will appear here once raised.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => {
            const cfg = disputeStatusConfig(dispute.Status);
            const border = STATUS_BORDER[dispute.Status] ?? "border-border-subtle";
            return (
              <div
                key={dispute.ID}
                className={`rounded-2xl border bg-bg-secondary p-5 space-y-3 ${border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <cfg.Icon size={15} className={cfg.className} />
                      <span className={`text-sm font-semibold ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      Order{" "}
                      <span className="font-mono text-xs text-white">
                        {String(dispute.OrderID).slice(0, 8)}…
                      </span>
                    </p>
                    {dispute.ArbitratorDisputeID !== null && (
                      <a
                        href={`${CONFIG.KLEROS_COURT_URL}/cases/${dispute.ArbitratorDisputeID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Kleros #{dispute.ArbitratorDisputeID} <FiExternalLink size={10} />
                      </a>
                    )}
                    {dispute.Ruling !== null && (
                      <p className="text-xs text-text-muted">
                        Ruling:{" "}
                        <span className="text-white font-medium">
                          {rulingLabel(dispute.Ruling)}
                        </span>
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/orders/${dispute.OrderID}/dispute`}
                    className="inline-flex items-center gap-1.5 border border-border-subtle text-sm font-semibold px-3 py-2 rounded-xl hover:border-primary hover:text-primary transition-all shrink-0"
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
