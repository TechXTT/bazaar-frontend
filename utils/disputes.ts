import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

/**
 * Canonical presentation metadata for on-chain dispute statuses, shared across
 * the order detail, dispute management, and seller dispute pages so the same
 * status always renders with the same label/icon/colour.
 */
export interface DisputeStatusConfig {
  label: string;
  Icon: IconType;
  /** Tailwind text colour class. */
  className: string;
}

export const DISPUTE_STATUS_CONFIG: Record<string, DisputeStatusConfig> = {
  fee_pending: { label: "Awaiting arbitration fee", Icon: FiClock,       className: "text-yellow-400" },
  arbitrating: { label: "Under arbitration",        Icon: FiAlertCircle, className: "text-orange-400" },
  resolved:    { label: "Resolved",                 Icon: FiCheckCircle, className: "text-green-400" },
  timed_out:   { label: "Timed out",                Icon: FiClock,       className: "text-text-muted" },
};

/** Fallback config for any unrecognised status value. */
export const DISPUTE_STATUS_FALLBACK: DisputeStatusConfig = {
  label: "Unknown",
  Icon: FiAlertCircle,
  className: "text-text-secondary",
};

export function disputeStatusConfig(status: string): DisputeStatusConfig {
  return DISPUTE_STATUS_CONFIG[status] ?? { ...DISPUTE_STATUS_FALLBACK, label: status };
}

/**
 * Arbitrator ruling codes. The receiver is the funds recipient (the seller in a
 * standard sale), so ruling 2 favours them.
 */
export const RULING_LABELS: Record<number, string> = {
  0: "Refused — receiver wins by default",
  1: "Buyer wins — refunded",
  2: "Receiver wins — funds released",
};

export function rulingLabel(ruling: number | null | undefined): string {
  if (ruling === null || ruling === undefined) return "Unknown";
  return RULING_LABELS[ruling] ?? "Unknown";
}
