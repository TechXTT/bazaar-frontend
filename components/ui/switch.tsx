"use client";

import clsx from "clsx";

/**
 * Vault toggle switch. Accessible (role=switch, keyboard via the underlying button).
 * Controlled: pass `checked` and `onChange`.
 */
export default function Switch({
  checked,
  onChange,
  disabled,
  id,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-vault-full border transition-colors focus:outline-none focus:ring-2 focus:ring-vault-accent focus:ring-offset-2 focus:ring-offset-vault-bg disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-vault-border-accent bg-vault-accent"
          : "border-vault-border-strong bg-vault-surface-2",
        className
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-1"
        )}
      />
    </button>
  );
}
