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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!auth.user) {
      router.replace("/auth/login");
      return;
    }
    disputesService
      .getDisputeByOrderID(order?.ID)
      .then((res) => { if (res.status === 200) setDispute(res.data); })
      .catch((err) => {
        // A 404 means no dispute row exists yet; anything else (network/500) is a
        // real error we shouldn't mask as "no dispute".
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [order?.ID, auth.user]);

  // The order's on-chain status flipped to "disputed" but the indexed dispute row
  // isn't readable yet (observer lag, or a failed insert). Don't render the
  // contradictory "no dispute raised" state in that case.
  const disputedButUnsynced = !dispute && notFound && order.Status === "disputed";

  const cfg = dispute ? DISPUTE_STATUS_CONFIG[dispute.Status] : null;

  return (
    <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-4">
      <p className="text-overline uppercase text-vault-text-tertiary">Dispute</p>

      {loading ? (
        <div className="h-4 w-32 rounded bg-vault-inset animate-pulse" />
      ) : disputedButUnsynced ? (
        <div className="flex items-start gap-2 text-body text-vault-text-secondary">
          <FiAlertCircle size={15} className="mt-0.5 shrink-0 text-vault-warning" />
          <span>
            A dispute has been raised on-chain for this order. Details are still
            syncing — check back shortly.
          </span>
        </div>
      ) : dispute ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {cfg && <cfg.Icon size={15} className={cfg.className} />}
            <span className="text-body-strong text-vault-text">
              {cfg?.label ?? dispute.Status}
            </span>
          </div>
          {dispute.Ruling !== null && (
            <p className="text-body text-vault-text-secondary">
              Ruling:{" "}
              <span className="text-vault-text font-medium">
                {rulingLabel(dispute.Ruling)}
              </span>
            </p>
          )}
          <Link
            href={`/orders/${order.ID}/dispute`}
            className="inline-flex items-center gap-1.5 text-body font-semibold text-vault-accent hover:underline"
          >
            Manage dispute <FiArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-body text-vault-text-secondary">
            No dispute has been raised for this order.
          </p>
          <Link
            href={`/orders/${order.ID}/dispute`}
            className="inline-flex items-center gap-2 text-body font-semibold border border-vault-border text-vault-text rounded-vault-md px-4 py-2.5 hover:border-vault-border-accent transition-colors"
          >
            <FiAlertCircle size={14} /> Raise a dispute
          </Link>
        </div>
      )}
    </div>
  );
};

export default OpenDispute;
