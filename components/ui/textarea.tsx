import clsx from "clsx";
import { forwardRef, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "min-h-[120px] w-full rounded-vault-md border bg-vault-inset px-3.5 py-2.5 text-body text-vault-text outline-none transition placeholder:text-vault-text-tertiary focus:border-vault-border-accent focus:ring-2 focus:ring-vault-accent/30",
        error ? "border-vault-danger" : "border-vault-border",
        className
      )}
      {...props}
    />
  );
});

export default Textarea;
