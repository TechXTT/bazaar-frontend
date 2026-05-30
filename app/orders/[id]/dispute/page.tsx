"use client";

import { disputesService, usersService } from "@/api";
import { IDispute, IDisputeEvidence } from "@/api/services/disputes";
import { CONFIG } from "@/config/config";
import {
  getArbitrationCost,
  getEscrowOrder,
  raiseDisputeBuyer,
  raiseDisputeReceiver,
  submitEvidence,
  timeoutByBuyer,
  timeoutByReceiver,
} from "@/components/escrow";
import { useWallet } from "@/hooks/useWallet";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiPaperclip,
  FiUpload,
} from "react-icons/fi";

function resolveURI(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `${CONFIG.IPFS_GATEWAY}/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

const STATUS_CONFIG: Record<string, { label: string; Icon: React.ElementType; className: string; bg: string }> = {
  fee_pending: { label: "Awaiting arbitration fee", Icon: FiClock,       className: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  arbitrating: { label: "Under arbitration",        Icon: FiAlertCircle, className: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  resolved:    { label: "Resolved",                 Icon: FiCheckCircle, className: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  timed_out:   { label: "Timed out",                Icon: FiClock,       className: "text-text-muted", bg: "bg-bg-secondary border-border-subtle" },
};

const RULING_LABELS: Record<number, string> = {
  0: "Refused — receiver wins by default",
  1: "Buyer wins — refunded",
  2: "Receiver wins — funds released",
};

export default function DisputePage() {
  const params = useParams();
  const orderId = params.id as string;
  const auth = useSelector((state: RootState) => state.auth);
  const wallet = useWallet();

  const [dispute, setDispute] = useState<IDispute | null>(null);
  const [evidence, setEvidence] = useState<IDisputeEvidence[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [arbitrationCost, setArbitrationCost] = useState<bigint>(BigInt(0));
  const [isBuyer, setIsBuyer] = useState(false);
  const [isReceiver, setIsReceiver] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const [disputeRes, evidenceRes] = await Promise.all([
        disputesService.getDisputeByOrderID(orderId),
        disputesService.getEvidence(orderId),
      ]);
      setDispute(disputeRes.data);
      setEvidence(evidenceRes.data ?? []);
    } catch {
      setDispute(null);
    }
  };

  useEffect(() => {
    if (!auth.isLoggedIn) return;

    getArbitrationCost().then(setArbitrationCost).catch(() => {});
    load();

    usersService.getMe().then((res) => {
      const myAddress = res.data.WalletAddress.toLowerCase();
      setWalletAddress(myAddress);

      getEscrowOrder(orderId)
        .then((escrowOrder) => {
          setIsBuyer(escrowOrder.buyer.toLowerCase() === myAddress);
          setIsReceiver(escrowOrder.receiver.toLowerCase() === myAddress);
        })
        .catch(() => {});
    });
  }, [auth.isLoggedIn, orderId]);

  const withPending = async (fn: () => Promise<void>) => {
    setIsPending(true);
    try {
      await wallet.ensureReady();
      await fn();
      await load();
    } catch (err: any) {
      toast.error(err?.reason ?? err?.message ?? "Transaction failed");
    } finally {
      setIsPending(false);
    }
  };

  const handleRaiseDispute = () =>
    withPending(async () => {
      if (isBuyer) await raiseDisputeBuyer(orderId, arbitrationCost);
      else if (isReceiver) await raiseDisputeReceiver(orderId, arbitrationCost);
    });

  const handlePayArbFee = () =>
    withPending(async () => {
      if (isBuyer) await raiseDisputeBuyer(orderId, arbitrationCost);
      else await raiseDisputeReceiver(orderId, arbitrationCost);
    });

  const handleTimeout = () =>
    withPending(async () => {
      if (isBuyer) await timeoutByBuyer(orderId);
      else await timeoutByReceiver(orderId);
    });

  const handleSubmitEvidence = async () => {
    if (!evidenceFile) { toast.error("Select a file first"); return; }

    setIsPending(true);
    try {
      await wallet.ensureReady();
      const formData = new FormData();
      formData.append("file", evidenceFile);
      const uploadRes = await fetch(`/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.jwt}` },
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("File upload failed");
      const { url } = await uploadRes.json();
      await submitEvidence(orderId, url);
      setEvidenceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (err: any) {
      toast.error(err?.reason ?? err?.message ?? "Evidence submission failed");
    } finally {
      setIsPending(false);
    }
  };

  const isParty = isBuyer || isReceiver;
  const hasDispute = dispute !== null;
  const isFeePending = dispute?.Status === "fee_pending";
  const isResolved = dispute?.Status === "resolved" || dispute?.Status === "timed_out";
  const myFeeDeposit = evidence.some((e) => e.Party === walletAddress);
  const arbCostETH = (Number(arbitrationCost) / 1e18).toFixed(4);
  const cfg = dispute ? STATUS_CONFIG[dispute.Status] : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href={`/orders/${orderId}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> Order detail
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold">Dispute</h1>
        <span className="font-mono text-sm text-text-muted bg-bg-secondary border border-border-subtle rounded-lg px-2.5 py-1">
          {orderId.slice(0, 8)}…
        </span>
      </div>

      {!auth.isLoggedIn && (
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 mb-4">
          <p className="text-sm text-text-secondary">
            <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link> to manage disputes.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Status */}
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Status</p>
          {hasDispute && cfg ? (
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${cfg.bg}`}>
                <cfg.Icon size={15} className={cfg.className} />
                <span className={`text-sm font-semibold ${cfg.className}`}>{cfg.label}</span>
              </div>
              {dispute.ArbitratorDisputeID !== null && (
                <p className="text-sm text-text-secondary">
                  Kleros dispute:{" "}
                  <a
                    href={`${CONFIG.KLEROS_COURT_URL}/cases/${dispute.ArbitratorDisputeID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    #{dispute.ArbitratorDisputeID} <FiExternalLink size={11} />
                  </a>
                </p>
              )}
              {dispute.Ruling !== null && (
                <div className="rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3">
                  <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Ruling</p>
                  <p className="text-sm font-semibold text-white">
                    {RULING_LABELS[dispute.Ruling] ?? "Unknown"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No dispute raised yet for this order.</p>
          )}
        </div>

        {/* Actions */}
        {isParty && !isResolved && (
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Actions</p>
            <div className="flex flex-wrap gap-2">
              {!hasDispute && (
                <button
                  onClick={handleRaiseDispute}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isPending ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FiAlertCircle size={14} />
                  )}
                  Raise Dispute ({arbCostETH} ETH)
                </button>
              )}
              {hasDispute && isFeePending && !myFeeDeposit && (
                <button
                  onClick={handlePayArbFee}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  Pay Arbitration Fee ({arbCostETH} ETH)
                </button>
              )}
              {hasDispute && isFeePending && (
                <button
                  onClick={handleTimeout}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 border border-border-subtle font-semibold px-4 py-2.5 rounded-xl hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isPending && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border-subtle border-t-white" />
                  )}
                  <FiClock size={14} /> Claim Timeout
                </button>
              )}
            </div>
          </div>
        )}

        {/* Evidence submission */}
        {isParty && hasDispute && !isResolved && (
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Submit Evidence</p>
            <p className="text-xs text-text-secondary">
              Upload a file (image, PDF, etc.). The URL will be recorded on-chain.
            </p>
            <label className="flex items-center gap-3 rounded-xl border border-border-subtle px-4 py-3 cursor-pointer hover:border-primary transition-colors">
              <FiPaperclip size={16} className="text-text-muted shrink-0" />
              <span className="text-sm text-text-secondary flex-1 truncate">
                {evidenceFile ? evidenceFile.name : "Choose a file…"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              onClick={handleSubmitEvidence}
              disabled={isPending || !evidenceFile}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isPending ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FiUpload size={14} />
              )}
              Submit Evidence
            </button>
          </div>
        )}

        {/* Evidence list */}
        {evidence.length > 0 && (
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Evidence ({evidence.length})
            </p>
            <div className="space-y-2">
              {evidence.map((ev) => (
                <div
                  key={ev.ID}
                  className="rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 space-y-1"
                >
                  <p className="text-xs text-text-muted">
                    Party:{" "}
                    <span className="font-mono">{ev.Party.slice(0, 10)}…</span>
                  </p>
                  <a
                    href={resolveURI(ev.URI)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
                  >
                    <FiExternalLink size={11} className="shrink-0" />
                    {ev.URI}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
