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
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[700px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-4 py-1.5 text-xs font-medium text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            On-chain escrow · Community arbitration
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            The{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Bazaar
            </span>
          </h1>

          <p className="text-lg text-text-secondary max-w-lg mx-auto leading-relaxed">
            A permissionless marketplace. Buy and sell anything with on-chain
            escrow and community-driven dispute resolution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/stores"
              className="bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Browse stores
            </Link>
            <Link
              href="/seller/stores"
              className="border border-border-subtle font-semibold px-8 py-3 rounded-xl hover:border-primary hover:bg-bg-secondary transition-all"
            >
              Open a store
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 pt-4 text-sm">
            {[
              { label: "Permissionless", desc: "No sign-up required" },
              { label: "Non-custodial", desc: "Funds held in contract" },
              { label: "Trustless", desc: "Community arbitration" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-semibold text-white">{s.label}</p>
                <p className="text-text-secondary text-xs mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured products</h2>
          <Link
            href="/stores"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            View all stores →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-bg-secondary animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-text-secondary">Could not load products.</p>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl border border-border-subtle bg-bg-secondary px-6 py-16 text-center">
            <p className="font-semibold">No products yet</p>
            <p className="mt-2 text-sm text-text-secondary">
              Be the first seller — open a store and list your products.
            </p>
            <Link
              href="/seller/stores"
              className="mt-6 inline-block bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Open a store
            </Link>
          </div>
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
