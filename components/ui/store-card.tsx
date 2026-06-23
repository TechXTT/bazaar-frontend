import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { IStore } from "@/api/interfaces/stores";

/**
 * Vault StoreCard (Figma node 6:20): gradient avatar tile, store name, a meta row
 * (product count · rating), and a trailing arrow.
 */
export default function StoreCard({ store }: { store: IStore }) {
  const productCount = store.Products?.length ?? 0;
  const score = store.Reputation?.Score;
  const initial = store.Name?.charAt(0)?.toUpperCase() || "?";
  return (
    <Link
      href={`/stores/${store.ID}`}
      className="group flex items-center gap-4 rounded-vault-lg border border-vault-border bg-vault-surface p-[18px] transition-all hover:border-vault-border-accent hover:shadow-vault-card"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-vault-accent to-vault-violet text-h3 font-semibold text-vault-on-accent">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-title text-vault-text">{store.Name}</p>
        <div className="mt-1 flex items-center gap-2 text-caption text-vault-text-tertiary">
          <span>
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          {score != null && (
            <>
              <span>•</span>
              <span className="text-vault-success">★ {score.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>
      <FiArrowRight
        size={18}
        className="shrink-0 text-vault-text-tertiary transition-colors group-hover:text-vault-accent"
      />
    </Link>
  );
}
