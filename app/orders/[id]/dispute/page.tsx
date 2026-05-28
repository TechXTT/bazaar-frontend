"use client";

import { disputesService, usersService } from "@/api";
import { IDispute, IDisputeEvidence } from "@/api/services/disputes";
import { CONFIG } from "@/config/config";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
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
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

function resolveURI(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return `${CONFIG.IPFS_GATEWAY}/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

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

    usersService.getMe().then((res) => {
      setWalletAddress(res.data.WalletAddress.toLowerCase());
    });

    getArbitrationCost().then(setArbitrationCost).catch(() => {});

    getEscrowOrder(orderId)
      .then((order) => {
        const me = wallet.account?.toLowerCase() ?? "";
        setIsBuyer(order.buyer.toLowerCase() === me);
        setIsReceiver(order.receiver.toLowerCase() === me);
      })
      .catch(() => {});

    load();
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
      if (isBuyer) {
        await raiseDisputeBuyer(orderId, arbitrationCost);
      } else if (isReceiver) {
        await raiseDisputeReceiver(orderId, arbitrationCost);
      }
    });

  const handlePayArbFee = () =>
    withPending(async () => {
      if (isBuyer) {
        await raiseDisputeBuyer(orderId, arbitrationCost);
      } else {
        await raiseDisputeReceiver(orderId, arbitrationCost);
      }
    });

  const handleTimeout = () =>
    withPending(async () => {
      if (isBuyer) {
        await timeoutByBuyer(orderId);
      } else {
        await timeoutByReceiver(orderId);
      }
    });

  const handleSubmitEvidence = async () => {
    if (!evidenceFile) {
      toast.error("Select a file first");
      return;
    }

    setIsPending(true);
    try {
      await wallet.ensureReady();

      // Upload file to S3 via backend
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
  const isArbitrating = dispute?.Status === "arbitrating";
  const isResolved = dispute?.Status === "resolved" || dispute?.Status === "timed_out";

  const myFeeDeposit =
    isBuyer
      ? evidence.some((e) => e.Party === walletAddress)
      : evidence.some((e) => e.Party === walletAddress);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Dispute — Order {orderId.slice(0, 8)}…</h1>

      {!auth.isLoggedIn ? (
        <Card className="p-4">
          <p className="text-sm text-text-secondary">Sign in to manage disputes.</p>
        </Card>
      ) : null}

      {/* Dispute status */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Status</h2>
        {hasDispute ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-text-secondary">On-chain status: </span>
              <span className="capitalize font-medium">{dispute.Status.replace("_", " ")}</span>
            </p>
            {dispute.ArbitratorDisputeID !== null && (
              <p>
                <span className="text-text-secondary">Kleros dispute: </span>
                <a
                  href={`${CONFIG.KLEROS_COURT_URL}/cases/${dispute.ArbitratorDisputeID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-500"
                >
                  #{dispute.ArbitratorDisputeID} — View on Kleros
                </a>
              </p>
            )}
            {dispute.Ruling !== null && (
              <p>
                <span className="text-text-secondary">Ruling: </span>
                <span className="font-medium">
                  {dispute.Ruling === 0
                    ? "Refused (receiver wins by default)"
                    : dispute.Ruling === 1
                    ? "Buyer wins — refunded"
                    : "Receiver wins — funds released"}
                </span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No dispute raised yet for this order.</p>
        )}
      </Card>

      {/* Actions */}
      {isParty && !isResolved ? (
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Actions</h2>
          <div className="flex flex-wrap gap-2">
            {!hasDispute ? (
              <Button onClick={handleRaiseDispute} disabled={isPending} isLoading={isPending}>
                Raise Dispute ({(Number(arbitrationCost) / 1e18).toFixed(4)} ETH)
              </Button>
            ) : null}

            {hasDispute && isFeePending && !myFeeDeposit ? (
              <Button onClick={handlePayArbFee} disabled={isPending} isLoading={isPending}>
                Pay Arbitration Fee ({(Number(arbitrationCost) / 1e18).toFixed(4)} ETH)
              </Button>
            ) : null}

            {hasDispute && isFeePending ? (
              <Button variant="secondary" onClick={handleTimeout} disabled={isPending} isLoading={isPending}>
                Claim Timeout
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {/* Evidence submission */}
      {isParty && hasDispute && !isResolved ? (
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Submit Evidence</h2>
          <p className="text-xs text-text-secondary">
            Upload a file (image, PDF, etc.). The URL will be recorded on-chain.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <Button
            onClick={handleSubmitEvidence}
            disabled={isPending || !evidenceFile}
            isLoading={isPending}
          >
            Submit Evidence
          </Button>
        </Card>
      ) : null}

      {/* Evidence list */}
      {evidence.length > 0 ? (
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Evidence ({evidence.length})</h2>
          <div className="space-y-2">
            {evidence.map((ev) => (
              <div key={ev.ID} className="rounded border border-border-subtle px-3 py-2 text-sm">
                <p className="text-text-secondary">
                  Party: <span className="font-mono text-xs">{ev.Party.slice(0, 10)}…</span>
                </p>
                <a
                  href={resolveURI(ev.URI)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline break-all"
                >
                  {ev.URI}
                </a>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
