"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import ProductCard from "@/app/stores/components/product";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    productsService
      .getAllProducts()
      .then((res) => setProducts(res.data.slice(0, 12)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
          The Bazaar
        </h1>
        <p className="text-lg text-text-secondary max-w-md">
          A decentralised marketplace. Buy and sell with on-chain escrow and
          community-driven dispute resolution.
        </p>
        <div className="flex gap-3">
          <Link
            href="/stores"
            className="bg-primary text-white font-semibold px-7 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Browse stores
          </Link>
          <Link
            href="/seller/stores"
            className="border border-border-subtle font-semibold px-7 py-3 rounded-xl hover:border-primary transition-colors"
          >
            Open a store
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured products</h2>
          <Link href="/stores" className="text-sm text-text-secondary hover:text-primary transition-colors">
            View all stores →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-bg-secondary animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-text-secondary">Could not load products.</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-text-secondary">No products listed yet.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.ID} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
