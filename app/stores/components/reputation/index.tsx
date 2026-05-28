import { IReputation } from "@/api/interfaces/stores";

function ScoreBadge({ score, large }: { score: number | null; large?: boolean }) {
  const size = large ? "px-3 py-1 text-sm font-semibold" : "px-2 py-0.5 text-xs font-medium";

  if (score === null) {
    return (
      <span className={`inline-block rounded-full bg-surface-sunken ${size} text-text-secondary`}>
        New seller
      </span>
    );
  }

  let colorClass = "bg-surface-sunken text-text-secondary";
  if (score >= 90) colorClass = "bg-status-success/20 text-status-success";
  else if (score >= 70) colorClass = "bg-teal-500/20 text-teal-400";
  else if (score >= 40) colorClass = "bg-status-warning/20 text-status-warning";

  return (
    <span className={`inline-block rounded-full ${colorClass} ${size}`}>
      ★ {score}
    </span>
  );
}

export function ScoreBadgeInline({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-text-muted">New seller</span>;

  let colorClass = "text-text-secondary";
  if (score >= 90) colorClass = "text-status-success";
  else if (score >= 70) colorClass = "text-teal-400";
  else if (score >= 40) colorClass = "text-status-warning";

  return <span className={`text-xs font-medium ${colorClass}`}>★ {score}</span>;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function ReputationCard({ rep }: { rep: IReputation | null }) {
  if (!rep || rep.TotalOrders === 0) {
    return <p className="text-sm text-text-secondary">No reputation yet</p>;
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
