import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-surface-sunken outline-none transition-colors placeholder:text-text-secondary focus:border-primary ${
        error ? "border-error" : "border-border-subtle"
      } ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";

export default Input;
