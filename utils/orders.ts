/**
 * XL-1: a single typed source of truth for order statuses. These are the exact
 * lowercase values the backend persists/returns (`pending|released|completed|
 * cancelled|shipped|disputed`). `created` is an accepted legacy alias for
 * `pending` on the wire but is normalised to `pending` for presentation.
 */
export const ORDER_STATUSES = [
  "pending",
  "released",
  "completed",
  "cancelled",
  "shipped",
  "disputed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Wire values the backend may send, including the legacy `created` alias. */
export type WireOrderStatus = OrderStatus | "created";

const ORDER_STATUS_SET = new Set<string>(ORDER_STATUSES);

/** Narrow an arbitrary string to a typed {@link OrderStatus}, defaulting to `pending`. */
export function toOrderStatus(status: string | null | undefined): OrderStatus {
  const s = status?.toLowerCase();
  if (s === "created") return "pending";
  return s && ORDER_STATUS_SET.has(s) ? (s as OrderStatus) : "pending";
}

/**
 * Canonical presentation metadata for order statuses, shared between the orders
 * list and order detail pages so a given status always renders identically.
 * Colours follow the Vault status mapping (Figma StatusBadge node 5:33):
 * Pending=warning · Shipped=info · Released=accent · Completed=success ·
 * Cancelled=tertiary · Disputed=danger.
 */
export interface OrderStatusConfig {
  label: string;
  className: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending:   { label: "Pending",   className: "bg-vault-warning-soft text-vault-warning border-vault-warning/30" },
  shipped:   { label: "Shipped",   className: "bg-vault-surface-3 text-vault-info border-vault-info/30" },
  released:  { label: "Released",  className: "bg-vault-accent-soft text-vault-accent border-vault-border-accent" },
  completed: { label: "Completed", className: "bg-vault-success-soft text-vault-success border-vault-success/30" },
  cancelled: { label: "Cancelled", className: "bg-vault-surface-2 text-vault-text-tertiary border-vault-border-strong" },
  disputed:  { label: "Disputed",  className: "bg-vault-danger-soft text-vault-danger border-vault-danger/30" },
};

export function orderStatusConfig(status: string): OrderStatusConfig {
  return ORDER_STATUS_CONFIG[toOrderStatus(status)];
}
