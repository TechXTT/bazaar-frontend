import { orderStatusConfig } from "@/utils/orders";

export default function OrderStatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const cfg = orderStatusConfig(status);
  const pad = size === "md" ? "px-3 py-1" : "px-2.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded-full text-xs font-semibold border ${pad} ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
