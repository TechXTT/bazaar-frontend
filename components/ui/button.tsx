import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-vault-accent text-vault-on-accent shadow-vault-glow hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:bg-vault-accent/50 disabled:shadow-none",
  secondary:
    "border border-vault-border bg-vault-surface text-vault-text hover:bg-vault-surface-2 hover:border-vault-border-accent",
  ghost: "text-vault-text-secondary hover:bg-white/10 hover:text-vault-text",
  danger: "bg-vault-danger text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export default function Button({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-vault-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-vault-accent focus:ring-offset-2 focus:ring-offset-vault-bg disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
      {children}
    </button>
  );
}
