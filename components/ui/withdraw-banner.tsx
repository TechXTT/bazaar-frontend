"use client";

import { getWithdrawable, withdraw } from "@/components/escrow";
import { useWallet } from "@/hooks/useWallet";
import { CONFIG } from "@/config/config";
import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { FiDownload, FiExternalLink } from "react-icons/fi";

/**
 * SC-6 pull-payment claim banner.
 *
 * After a dispute the escrow credits the winner's ETH to `withdrawable[address]`
 * (instead of auto-sending). This banner reads that balance for the connected
 * wallet and, when it is > 0, offers a one-click `withdraw()` with the usual tx UX
 * (toast handled by the escrow helper, disabled-while-pending, Etherscan link).
 *
 * Renders nothing when there is nothing to claim, so it is safe to mount at the top
 * of the Orders and Dispute-detail screens.
 */
export default function WithdrawBanner({ className }: { className?: string }) {
  const { account, connected } = useWallet();
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) {
      setAmount(BigInt(0));
      return;
    }
    try {
      setAmount(await getWithdrawable(account));
    } catch {
      setAmount(BigInt(0));
    }
  }, [account]);

  useEffect(() => {
    void refresh();
  }, [refresh, connected]);

  if (amount <= BigInt(0)) return null;

  const onWithdraw = async () => {
    setPending(true);
    try {
      const tx = await withdraw();
      setTxHash(tx.hash);
      await tx.wait().catch(() => undefined);
      await refresh();
    } finally {
      setPending(false);
    }
  };

  const explorer = CONFIG.ETHERSCAN_TX_BASE_URL && txHash
    ? `${CONFIG.ETHERSCAN_TX_BASE_URL.replace(/\/$/, "")}/${txHash}`
    : null;

  return (
    <div
      className={`flex flex-col gap-4 rounded-vault-lg border border-vault-border-accent bg-vault-accent-soft p-5 shadow-vault-glow sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-vault-md bg-vault-accent/15 text-vault-accent">
          <FiDownload size={18} />
        </div>
        <div>
          <p className="text-title text-vault-text">Funds ready to withdraw</p>
          <p className="mt-0.5 text-caption text-vault-text-secondary">
            You have{" "}
            <span className="font-semibold text-vault-text">
              {ethers.formatEther(amount)} ETH
            </span>{" "}
            credited from a resolved dispute. Claim it to your wallet.
          </p>
          {explorer && (
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-caption text-vault-accent hover:underline"
            >
              View transaction <FiExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
      <button
        onClick={onWithdraw}
        disabled={pending}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-vault-md bg-vault-accent px-5 py-2.5 text-body-strong text-vault-on-accent shadow-vault-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <FiDownload size={15} />
        )}
        Withdraw
      </button>
    </div>
  );
}
