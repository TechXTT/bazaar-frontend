import { ReactNode } from "react";

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon?: ReactNode;
  title: string;
};

export default function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <div className="rounded-vault-lg border border-dashed border-vault-border-strong bg-vault-surface px-6 py-12 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-vault-lg border border-vault-border-accent bg-vault-accent-soft text-vault-accent">
          {icon}
        </div>
      ) : null}
      <h2 className="text-h3 font-semibold text-vault-text">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-body text-vault-text-secondary">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
