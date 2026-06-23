import clsx from "clsx";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "panel" | "sunken";
};

export default function Card({ className, variant = "panel", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-vault-lg border p-5 shadow-vault-card",
        variant === "panel"
          ? "border-vault-border bg-vault-surface"
          : "border-vault-border bg-vault-inset",
        className
      )}
      {...props}
    />
  );
}
