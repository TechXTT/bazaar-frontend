"use client";

import clsx from "clsx";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

/**
 * Vault segmented control — an inset track with pill-highlighted options. Useful for
 * the token toggle (ETH / USDC) and small view switches. Controlled component.
 */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  "aria-label": ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  const pad = size === "sm" ? "px-3 py-1 text-label" : "px-4 py-1.5 text-body-strong";
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center gap-1 rounded-vault-full border border-vault-border bg-vault-inset p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "rounded-vault-full font-medium transition-colors",
              pad,
              active
                ? "bg-vault-accent text-vault-on-accent shadow-vault-glow"
                : "text-vault-text-secondary hover:text-vault-text"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
