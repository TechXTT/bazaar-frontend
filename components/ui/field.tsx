import { ReactNode } from "react";
import Label from "./label";

type FieldProps = {
  children: ReactNode;
  error?: string;
  helper?: string;
  htmlFor?: string;
  label: string;
};

export default function Field({ children, error, helper, htmlFor, label }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-status-danger">{error}</p> : null}
      {!error && helper ? <p className="text-sm text-text-muted">{helper}</p> : null}
    </div>
  );
}
