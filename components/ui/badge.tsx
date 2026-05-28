import clsx from "clsx";
import { HTMLAttributes } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-status-success/20 text-status-success",
  warning: "bg-status-warning/20 text-status-warning",
  danger: "bg-status-danger/20 text-status-danger",
  info: "bg-status-info/20 text-status-info",
  muted: "bg-white/10 text-text-secondary",
};

export default function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variant = (props as { variant?: BadgeVariant }).variant || "muted";

  return (
    <span
      {...props}
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    />
  );
}
