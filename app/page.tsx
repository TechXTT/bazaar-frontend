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
    <main className="max-w-screen-xl mx-auto px-4">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">The Bazaar</h1>
        <p className="text-xl text-text-secondary max-w-lg">
          A decentralised marketplace. Buy and sell with on-chain escrow and
          community-driven dispute resolution.
        </p>
        <Link
          href="/stores"
          className="bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Browse stores
        </Link>
      </section>

      {/* Featured products */}
      <section className="pb-20 space-y-6">
        <h2 className="text-2xl font-bold">Featured products</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-lg bg-bg-secondary animate-pulse"
              />
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
          <div className="flex flex-wrap">
            {products.map((product) => (
              <ProductCard key={product.ID} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
