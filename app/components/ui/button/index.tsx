import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

const VARIANTS = {
  primary: "bg-primary text-white hover:opacity-90",
  secondary: "bg-bg-secondary border border-border-subtle hover:border-primary text-white",
  ghost: "hover:bg-bg-secondary text-text-secondary hover:text-white",
};

const Button = ({
  variant = "primary",
  isLoading,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) => (
  <button
    disabled={disabled || isLoading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {isLoading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
);

export default Button;
