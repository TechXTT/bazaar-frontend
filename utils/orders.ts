/**
 * Canonical presentation metadata for order statuses, shared between the orders
 * list and order detail pages so a given status always renders identically.
 */
export interface OrderStatusConfig {
  label: string;
  className: string;
}

export const ORDER_STATUS_CONFIG: Record<string, OrderStatusConfig> = {
  pending:   { label: "Pending",   className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  created:   { label: "Pending",   className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  shipped:   { label: "Shipped",   className: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  completed: { label: "Completed", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  released:  { label: "Released",  className: "bg-green-500/15 text-green-400 border-green-500/20" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/20" },
  disputed:  { label: "Disputed",  className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
};

export function orderStatusConfig(status: string): OrderStatusConfig {
  return (
    ORDER_STATUS_CONFIG[status?.toLowerCase()] ?? {
      label: status,
      className: "bg-bg-secondary text-text-secondary border-border-subtle",
    }
  );
}
