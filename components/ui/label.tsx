import { LabelHTMLAttributes } from "react";

export default function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="text-label text-vault-text-secondary" {...props} />;
}
