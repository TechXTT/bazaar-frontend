import clsx from "clsx";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "panel" | "sunken";
};

export default function Card({ className, variant = "panel", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-md border p-4 shadow-sm",
        variant === "panel"
          ? "border-border-subtle bg-surface-panel"
          : "border-border-subtle bg-surface-sunken",
        className
      )}
      {...props}
    />
  );
}
