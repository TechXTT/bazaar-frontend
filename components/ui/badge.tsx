import clsx from "clsx";
import { HTMLAttributes } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-vault-success-soft text-vault-success",
  warning: "bg-vault-warning-soft text-vault-warning",
  danger: "bg-vault-danger-soft text-vault-danger",
  info: "bg-vault-info/15 text-vault-info",
  muted: "bg-vault-surface-2 text-vault-text-secondary",
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
