import Link from "next/link";
import { IProduct } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import { settlementCurrencyFromUnit } from "@/utils/helpers";

/**
 * Vault ProductCard (Figma node 6:5): surface card, rounded-16, image header with an
 * "Escrow protected" success pill, store row, title, price with token pill.
 */
export default function ProductCard({ product }: { product: IProduct }) {
  const currency = settlementCurrencyFromUnit(product.Unit);
  const storeName = product.Store?.Name;
  return (
    <Link
      href={`/products/${product.ID}`}
      className="group flex w-full flex-col overflow-hidden rounded-vault-lg border border-vault-border bg-vault-surface shadow-vault-card transition-all hover:border-vault-border-accent hover:shadow-vault-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <BucketImage
          imageURL={product.ImageURL}
          name={product.Name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3.5 top-3.5 inline-flex items-center rounded-vault-full border border-vault-success bg-vault-success-soft px-2.5 py-1 text-label text-vault-success">
          Escrow protected
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {storeName && (
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-vault-accent to-vault-violet" />
            <span className="truncate text-caption text-vault-text-tertiary">{storeName}</span>
          </div>
        )}

        <h3 className="line-clamp-2 text-title text-vault-text">{product.Name}</h3>

        <div className="flex items-center justify-between">
          <p className="text-h3 font-semibold tracking-[-0.1px] text-vault-text">
            {product.Price} {product.Unit || currency}
          </p>
          <span className="inline-flex items-center rounded-vault-full border border-vault-border-strong bg-vault-surface-2 px-2.5 py-1 text-label text-vault-text-secondary">
            {currency}
          </span>
        </div>
      </div>
    </Link>
  );
}
