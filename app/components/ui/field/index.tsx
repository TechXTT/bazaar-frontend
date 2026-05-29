import { ReactNode } from "react";

const Field = ({
  label,
  htmlFor,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  helper?: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {label}
    </label>
    {children}
    {error ? (
      <p className="text-xs text-error">{error}</p>
    ) : helper ? (
      <p className="text-xs text-text-secondary">{helper}</p>
    ) : null}
  </div>
);

export default Field;
