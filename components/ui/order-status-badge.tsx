import clsx from "clsx";
import { orderStatusConfig, type OrderStatus } from "@/utils/orders";

/**
 * Vault status pill (Figma StatusBadge node 5:33): a small status dot followed by
 * the label, on a soft tinted background. Colours come from {@link orderStatusConfig}.
 */
export default function OrderStatusBadge({
  status,
  size = "sm",
  withDot = true,
}: {
  status: OrderStatus | string;
  size?: "sm" | "md";
  withDot?: boolean;
}) {
  const cfg = orderStatusConfig(status);
  const pad = size === "md" ? "pl-2.5 pr-3 py-1 text-sm" : "pl-2 pr-2.5 py-0.5 text-xs";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        pad,
        cfg.className
      )}
    >
      {withDot && <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-current" />}
      {cfg.label}
    </span>
  );
}
