import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      rows={4}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-surface-sunken outline-none transition-colors placeholder:text-text-secondary focus:border-primary resize-none ${
        error ? "border-error" : "border-border-subtle"
      } ${className}`}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export default Textarea;
