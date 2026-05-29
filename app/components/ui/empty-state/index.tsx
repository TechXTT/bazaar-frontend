import { ReactNode } from "react";

const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary px-6 py-16 text-center">
    <p className="text-lg font-semibold">{title}</p>
    {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
