"use client";

import { productsService, storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { useParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import ProductCard from "@/app/stores/components/product";
import ReputationCard from "@/app/stores/components/reputation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IProduct } from "@/api/interfaces/products";
import { FiArrowLeft, FiPackage } from "react-icons/fi";

function StoreAvatar({ name, size = "lg" }: { name: string; size?: "lg" | "sm" }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const hue = (name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6) * 60;
  const dim = size === "lg" ? "h-16 w-16 text-2xl rounded-2xl" : "h-10 w-10 text-base rounded-xl";
  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold text-white shadow-inner ${dim}`}
      style={{ background: `hsl(${hue}, 40%, 30%)`, border: `1px solid hsl(${hue}, 40%, 40%)` }}
    >
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
        const date = new Date(raw.split(" ")[0] + " " + raw.split(" ")[1]).getTime();
        setCursor(new Date(date + 2 * 60 * 60 * 1000).toISOString());
      }
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 500) {
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
        <div className="h-6 w-32 rounded-lg bg-bg-secondary animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-bg-secondary animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-lg bg-bg-secondary animate-pulse" />
            <div className="h-4 w-24 rounded-lg bg-bg-secondary animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-bg-secondary animate-pulse" />
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
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> All stores
      </Link>

      {/* Store header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-10">
        {/* Left: identity */}
        <div className="flex items-center gap-4 flex-1">
          <StoreAvatar name={store.Name} />
          <div>
            <h1 className="text-2xl font-bold">{store.Name}</h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {products.length > 0
                ? `${products.length} product${products.length !== 1 ? "s" : ""}`
                : "Independent seller"}
            </p>
          </div>
        </div>

        {/* Right: reputation card */}
        <div className="w-full lg:w-72 shrink-0 rounded-2xl border border-border-subtle bg-bg-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            Seller Reputation
          </p>
          {hasRep ? (
            <ReputationCard rep={store.Reputation ?? null} />
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <FiPackage size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">New seller</p>
                <p className="text-xs text-text-muted">No orders yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border-subtle mb-8" />

      {/* Products */}
      {products.length === 0 && !enableScroll && (
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary px-6 py-20 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <FiPackage size={20} />
          </div>
          <p className="font-semibold text-white">No products yet</p>
          <p className="text-sm text-text-secondary">This store hasn&apos;t listed any products.</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
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
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
        </div>
      )}
    </div>
  );
};

export default StorePage;
