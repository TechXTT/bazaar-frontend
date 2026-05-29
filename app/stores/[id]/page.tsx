"use client";

import { productsService, storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { useParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import ProductCard from "@/app/stores/components/product";
import ReputationCard from "@/app/stores/components/reputation";
import Card from "@/components/ui/card";
import { useEffect, useState } from "react";
import { IProduct } from "@/api/interfaces/products";

const StorePage = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [cursor, setCursor] = useState<string>("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [enableScroll, setEnableScroll] = useState<boolean>(true);
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
          const next = response.data.filter((p) => !ids.has(p.ID));
          return [...prev, ...next];
        });
      }

      const raw = response.headers["next-cursor"];
      if (raw) {
        const date = new Date(
          raw.split(" ")[0] + " " + raw.split(" ")[1]
        ).getTime();
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
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-10 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 w-48 rounded-lg bg-bg-secondary animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          {store.Name}
        </h1>
        <Card className="w-full p-4 lg:w-72 shrink-0">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
            Seller reputation
          </h2>
          <ReputationCard rep={store.Reputation ?? null} />
        </Card>
      </div>

      {products.length === 0 && !enableScroll && (
        <p className="text-text-secondary">No products in this store yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.ID} product={product} />
        ))}
      </div>

      {enableScroll && (
        <div ref={ref} className="flex justify-center py-8">
          <p className="text-sm text-text-secondary">Loading more…</p>
        </div>
      )}
    </div>
  );
};

export default StorePage;
