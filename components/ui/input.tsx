import clsx from "clsx";
import { forwardRef, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-lg border bg-surface-sunken px-3.5 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-surface-accent/40",
        error ? "border-status-danger" : "border-border-subtle",
        className
      )}
      {...props}
    />
  );
});

export default Input;
