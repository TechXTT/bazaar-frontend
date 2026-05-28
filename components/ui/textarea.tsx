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
        "min-h-[120px] w-full rounded-md border bg-surface-sunken px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:ring-2 focus:ring-surface-accent",
        error ? "border-status-danger" : "border-border-subtle",
        className
      )}
      {...props}
    />
  );
});

export default Textarea;
