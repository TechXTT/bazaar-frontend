"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import ProductCard from "@/app/stores/components/product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiShield, FiLock, FiUsers, FiArrowRight } from "react-icons/fi";

const HOW_IT_WORKS = [
  {
    Icon: FiLock,
    title: "Connect your wallet",
    desc: "No account needed. Your Ethereum wallet is your identity.",
  },
  {
    Icon: FiShield,
    title: "Buy with escrow",
    desc: "Funds are held in a smart contract — released only when you confirm delivery.",
  },
  {
    Icon: FiUsers,
    title: "Community arbitration",
    desc: "Disputes are resolved by the community, not a centralised authority.",
  },
];

export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    productsService
      .getAllProducts()
      .then((res) => setProducts(res.data.slice(0, 8)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-indigo-500/8 blur-[120px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Powered by Ethereum · Open source
              </div>

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
                The world&apos;s most{" "}
                <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                  trustless
                </span>{" "}
                marketplace.
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed max-w-md">
                Buy and sell anything with on-chain escrow protection and
                community-driven dispute resolution. No middlemen. No censorship.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  Browse stores <FiArrowRight size={16} />
                </Link>
                <Link
                  href="/seller/stores"
                  className="inline-flex items-center gap-2 border border-border-subtle font-semibold px-7 py-3.5 rounded-xl hover:border-primary hover:bg-bg-secondary transition-all"
                >
                  Open a store
                </Link>
              </div>

              <div className="flex flex-wrap gap-8 pt-2 border-t border-border-subtle">
                {[
                  { value: "0%", label: "Platform fees" },
                  { value: "∞", label: "Censorship resistance" },
                  { value: "24/7", label: "Always online" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual — decorative rings */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-full border border-border-subtle opacity-40" />
                <div className="absolute inset-8 rounded-full border border-primary/20" />
                <div className="absolute inset-16 rounded-full border border-primary/30" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-bg-secondary border border-border-subtle shadow-2xl">
                    <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
                      <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="4.5" fill="none"/>
                      <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
                      <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                      <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Orbiting badges */}
                {(
                  [
                    { label: "Escrow", sub: "Protected", angle: -45 },
                    { label: "Web3", sub: "Native", angle: 90 },
                    { label: "Open", sub: "Source", angle: 225 },
                  ] as { label: string; sub: string; angle: number }[]
                ).map(({ label, sub, angle }) => {
                  const rad = (angle * Math.PI) / 180;
                  const r = 46;
                  const x = 50 + r * Math.cos(rad);
                  const y = 50 + r * Math.sin(rad);
                  return (
                    <div
                      key={label}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-subtle bg-bg-secondary px-3 py-1.5 text-center shadow-lg"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-text-muted">{sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="text-3xl font-bold">Trade with confidence</h2>
          <p className="text-text-secondary max-w-md mx-auto text-sm leading-relaxed">
            Smart contracts guarantee fairness. Every trade is protected from start to finish.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border-subtle bg-bg-secondary p-7 space-y-4 hover:border-primary/40 transition-colors"
            >
              <span className="absolute top-5 right-5 text-xs font-bold text-text-muted">0{i + 1}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <step.Icon size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured products ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Featured products</h2>
            <p className="text-sm text-text-secondary">Hand-picked from stores on The Bazaar.</p>
          </div>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-bg-secondary animate-pulse">
                <div className="aspect-square" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-border-subtle" />
                  <div className="h-3 w-1/3 rounded bg-border-subtle" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-text-secondary text-sm">Could not load products.</p>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary px-6 py-20 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
                <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="5" fill="none"/>
                <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">No products yet</p>
              <p className="mt-1.5 text-sm text-text-secondary">Be the first seller — open a store and list your products.</p>
            </div>
            <Link
              href="/seller/stores"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Open a store <FiArrowRight size={14} />
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

      {/* ─── Seller CTA ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-secondary p-10 sm:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/15 blur-[80px]" />
          <div className="relative grid sm:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">For sellers</p>
              <h2 className="text-3xl font-bold leading-snug">Start selling in minutes, not days.</h2>
              <p className="text-text-secondary leading-relaxed text-sm">
                No application, no approval, no fees. Connect your wallet, create a store, and start earning crypto immediately.
              </p>
            </div>
            <div className="flex sm:justify-end gap-3 flex-wrap">
              <Link
                href="/seller/stores"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                Open a store <FiArrowRight size={16} />
              </Link>
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 border border-border-subtle font-semibold px-7 py-3.5 rounded-xl hover:bg-bg-secondary transition-all"
              >
                Browse first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
