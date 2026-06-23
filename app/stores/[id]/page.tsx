"use client";

import { productsService, storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { useParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import ProductCard from "@/app/stores/components/product";
import ReputationCard from "@/app/stores/components/reputation";
import Skeleton from "@/components/ui/skeleton";
import Spinner from "@/components/ui/spinner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProduct } from "@/api/interfaces/products";
import { FiArrowLeft, FiPackage } from "react-icons/fi";

/**
 * The backend's `next-cursor` header is a Go time string, e.g.
 * "2026-05-31 12:34:56.789 +0000 UTC". Parse it into a timezone-correct ISO
 * string to send back as the next cursor. We anchor on the explicit numeric
 * offset (e.g. "+0000") so the viewer's local timezone never skews the value —
 * this replaces an earlier hack that hard-coded a +2h shift.
 */
function parseCursorTimestamp(raw: string): string | null {
  const match = raw.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*([+-]\d{2})(\d{2})/
  );
  if (match) {
    const [, date, time, offH, offM] = match;
    const ms = Date.parse(`${date}T${time}${offH}:${offM}`);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  }
  // Fallback: let Date attempt to parse it directly (handles ISO-8601 cursors).
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

function StoreAvatar({ name }: { name: string }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-vault-lg bg-gradient-to-br from-vault-accent to-vault-violet text-display-l font-bold text-vault-on-accent shadow-vault-card ring-4 ring-vault-bg">
      {letter}
    </div>
  );
}

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [cursor, setCursor] = useState<string>("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [enableScroll, setEnableScroll] = useState(true);
  const [ref, inView] = useInView();

  useEffect(() => {
    storesService.getStore(id).then((res) => setStore(res.data)).catch(() => {});
  }, [id]);

  const fetchProducts = async () => {
    try {
      const response = await productsService.getProducts(id, cursor);
      if (response.data.length > 0) {
        setProducts((prev) => {
          const ids = new Set(prev.map((p) => p.ID));
          return [...prev, ...response.data.filter((p) => !ids.has(p.ID))];
        });
      }
      const raw = response.headers["next-cursor"];
      if (raw) {
        const next = parseCursorTimestamp(raw);
        if (next) setCursor(next);
        else setEnableScroll(false);
      }
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 500) {
        setEnableScroll(false);
      }
    }
  };

  useEffect(() => {
    if (inView) fetchProducts();
  }, [inView]);

  if (!store) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8 space-y-8">
        <Skeleton h={24} w={128} />
        <Skeleton className="h-40 rounded-vault-xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-vault-lg" />
          <div className="space-y-2">
            <Skeleton h={24} w={160} />
            <Skeleton h={16} w={96} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-vault-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasRep = store.Reputation && store.Reputation.TotalOrders > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/stores"
        className="inline-flex items-center gap-1.5 text-body text-vault-text-secondary hover:text-vault-text transition-colors mb-6"
      >
        <FiArrowLeft size={14} /> All stores
      </Link>

      {/* Gradient banner */}
      <div className="relative h-40 overflow-hidden rounded-vault-xl bg-gradient-to-br from-vault-accent via-vault-violet to-vault-accent">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
      </div>

      {/* Store header */}
      <div className="-mt-10 px-2 flex flex-col gap-6 lg:flex-row lg:items-start mb-10">
        {/* Left: identity */}
        <div className="flex flex-1 items-end gap-4">
          <StoreAvatar name={store.Name} />
          <div className="pb-1 space-y-1">
            <h1 className="text-h1 font-bold text-vault-text">{store.Name}</h1>
            <p className="text-body text-vault-text-secondary">
              {products.length > 0
                ? `${products.length} product${products.length !== 1 ? "s" : ""}`
                : "Independent seller"}
            </p>
          </div>
        </div>

        {/* Right: reputation card */}
        <div className="w-full lg:w-72 shrink-0 rounded-vault-lg border border-vault-border bg-vault-surface p-5">
          <p className="text-overline uppercase text-vault-text-tertiary mb-4">
            Seller Reputation
          </p>
          {hasRep ? (
            <ReputationCard rep={store.Reputation ?? null} />
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-vault-md bg-vault-accent-soft border border-vault-border-accent text-vault-accent">
                <FiPackage size={16} />
              </div>
              <div>
                <p className="text-body-strong text-vault-text">New seller</p>
                <p className="text-caption text-vault-text-tertiary">No orders yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-vault-border mb-8" />

      {/* Products */}
      {products.length === 0 && !enableScroll && (
        <div className="rounded-vault-lg border border-vault-border bg-vault-surface px-6 py-20 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-vault-md bg-vault-accent-soft border border-vault-border-accent text-vault-accent">
            <FiPackage size={20} />
          </div>
          <p className="text-title text-vault-text">No products yet</p>
          <p className="text-body text-vault-text-secondary">This store hasn&apos;t listed any products.</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4">
          <p className="text-overline uppercase text-vault-text-tertiary">
            Products
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.ID} product={product} />
            ))}
          </div>
        </div>
      )}

      {enableScroll && (
        <div ref={ref} className="flex justify-center py-10">
          <Spinner className="h-5 w-5 text-vault-accent" />
        </div>
      )}
    </div>
  );
};

export default StorePage;
