import { IReputation } from "@/api/interfaces/stores";

function ScoreBadge({ score, large }: { score: number | null; large?: boolean }) {
  const size = large ? "px-3 py-1 text-body-strong" : "px-2 py-0.5 text-label";

  if (score === null) {
    return (
      <span className={`inline-block rounded-vault-full bg-vault-surface-2 ${size} text-vault-text-secondary`}>
        New seller
      </span>
    );
  }

  let colorClass = "bg-vault-surface-2 text-vault-text-secondary";
  if (score >= 90) colorClass = "bg-vault-success-soft text-vault-success";
  else if (score >= 70) colorClass = "bg-vault-success-soft text-vault-success";
  else if (score >= 40) colorClass = "bg-vault-warning-soft text-vault-warning";

  return (
    <span className={`inline-block rounded-vault-full ${colorClass} ${size}`}>
      ★ {score}
    </span>
  );
}

export function ScoreBadgeInline({ score }: { score: number | null }) {
  if (score === null) return <span className="text-caption text-vault-text-tertiary">New seller</span>;

  let colorClass = "text-vault-text-secondary";
  if (score >= 90) colorClass = "text-vault-success";
  else if (score >= 70) colorClass = "text-vault-success";
  else if (score >= 40) colorClass = "text-vault-warning";

  return <span className={`text-label ${colorClass}`}>★ {score}</span>;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-body">
      <span className="text-vault-text-secondary">{label}</span>
      <span className="font-medium text-vault-text">{value}</span>
    </div>
  );
}

export default function ReputationCard({ rep }: { rep: IReputation | null }) {
  if (!rep || rep.TotalOrders === 0) {
    return <p className="text-body text-vault-text-secondary">No reputation yet</p>;
  }

  const completionRate = Math.round((rep.CompletedOrders / rep.TotalOrders) * 100);
  const disputeRate = Math.round((rep.DisputeCount / rep.TotalOrders) * 100);

  return (
    <div className="space-y-3">
      <ScoreBadge score={rep.Score} large />
      <StatRow label="Completion rate" value={`${completionRate}%`} />
      <StatRow label="Dispute rate" value={`${disputeRate}%`} />
      <StatRow label="Orders completed" value={rep.CompletedOrders} />
      <StatRow label="Disputes" value={rep.DisputeCount} />
      {rep.DisputeSellerWon > 0 && (
        <StatRow label="Seller wins" value={rep.DisputeSellerWon} />
      )}
    </div>
  );
}
