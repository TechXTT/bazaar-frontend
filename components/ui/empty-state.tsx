import { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon?: ReactNode;
  title: string;
};

export default function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-border-strong bg-surface-panel px-6 py-10 text-center">
      {icon ? <div className="mx-auto mb-4 flex justify-center text-text-muted">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
