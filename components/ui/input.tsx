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
        "w-full rounded-vault-md border bg-vault-inset px-3.5 py-2.5 text-body text-vault-text outline-none transition placeholder:text-vault-text-tertiary focus:border-vault-border-accent focus:ring-2 focus:ring-vault-accent/30",
        error ? "border-vault-danger" : "border-vault-border",
        className
      )}
      {...props}
    />
  );
});

export default Input;
