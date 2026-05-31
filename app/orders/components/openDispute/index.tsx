"use client";

import { disputesService } from "@/api";
import { IDispute } from "@/api/interfaces/disputes";
import { IOrder } from "@/api/interfaces/products";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { DISPUTE_STATUS_CONFIG, rulingLabel } from "@/utils/disputes";

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
      .then((res) => { if (res.status === 200) setDispute(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [order?.ID, auth.user]);

  const cfg = dispute ? DISPUTE_STATUS_CONFIG[dispute.Status] : null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Dispute</p>

      {loading ? (
        <div className="h-4 w-32 rounded bg-surface-sunken animate-pulse" />
      ) : dispute ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {cfg && <cfg.Icon size={15} className={cfg.className} />}
            <span className="text-sm font-medium text-white">
              {cfg?.label ?? dispute.Status}
            </span>
          </div>
          {dispute.Ruling !== null && (
            <p className="text-sm text-text-secondary">
              Ruling:{" "}
              <span className="text-white font-medium">
                {rulingLabel(dispute.Ruling)}
              </span>
            </p>
          )}
          <Link
            href={`/orders/${order.ID}/dispute`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Manage dispute <FiArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            No dispute has been raised for this order.
          </p>
          <Link
            href={`/orders/${order.ID}/dispute`}
            className="inline-flex items-center gap-2 text-sm font-semibold border border-border-subtle rounded-xl px-4 py-2.5 hover:border-primary transition-colors"
          >
            <FiAlertCircle size={14} /> Raise a dispute
          </Link>
        </div>
      )}
    </div>
  );
};

export default OpenDispute;
