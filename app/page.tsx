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

function HeroVisual() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div className="relative w-full max-w-[380px] animate-float">
        {/* Glow halo */}
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-primary/20 blur-[90px]" />
        <div className="pointer-events-none absolute -inset-6 top-1/2 rounded-full bg-violet-500/15 blur-[60px]" />

        {/* Main card — gradient border via wrapper */}
        <div className="relative rounded-2xl p-px bg-gradient-to-b from-primary/40 via-primary/10 to-transparent shadow-2xl shadow-black/50">
          <div className="rounded-[15px] bg-[#1a2d31] overflow-hidden">
            {/* Image area */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/25 via-[#1a2d31] to-surface-sunken">
              {/* Faint grid backdrop */}
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute inset-0 grid grid-cols-2 gap-4 p-5">
                <div className="rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-lg bg-primary/40 shadow-inner shadow-primary/20" />
                </div>
                <div className="rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-lg bg-indigo-400/30" />
                </div>
                <div className="rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-lg bg-violet-400/30" />
                </div>
                <div className="rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-lg bg-primary/40 shadow-inner shadow-primary/20" />
                </div>
              </div>
              {/* Store label */}
              <div className="absolute top-3 left-3 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-white/10">
                <p className="text-xs font-semibold text-white/90">TechStore Pro</p>
              </div>
              {/* Rating */}
              <div className="absolute top-3 right-3 rounded-lg bg-black/60 backdrop-blur-sm px-2 py-1 border border-white/10 flex items-center gap-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs font-semibold text-white/90">4.9</span>
              </div>
            </div>

            {/* Product info */}
            <div className="p-4 space-y-3 border-t border-primary/10">
              <div>
                <p className="font-semibold text-white">Hardware Wallet v3</p>
                <p className="text-xs text-text-muted mt-0.5">Digital security device</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold text-lg">0.042 ETH</span>
                <div className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg shadow-primary/40">
                  Add to cart
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badge: Escrow protected */}
        <div className="absolute -bottom-4 -left-8 rounded-xl border border-green-500/30 bg-[#182e22]/90 backdrop-blur-sm px-3 py-2 shadow-xl shadow-black/40 animate-float-delayed">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="text-xs font-semibold text-green-400">Escrow protected</span>
          </div>
        </div>

        {/* Floating badge: On-chain */}
        <div className="absolute -top-4 -right-6 rounded-xl border border-primary/30 bg-[#1c1a38]/90 backdrop-blur-sm px-3 py-2 shadow-xl shadow-black/40">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" style={{ animationDelay: "0.8s" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold text-primary">On-chain escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <section className="relative min-h-[calc(100vh-64px)] flex items-center">
        {/* Glow blobs — isolated so they don't clip the text */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/4 h-[700px] w-[900px] rounded-full bg-primary/20 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-violet-600/15 blur-[140px]" />
          <div className="absolute top-1/3 -left-32 h-[400px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Powered by Ethereum · Open source
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
                The world&apos;s most{" "}
                <span className="bg-gradient-to-r from-primary via-violet-400 to-indigo-400 bg-clip-text text-transparent">
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
                  className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
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

              <div className="flex flex-wrap gap-10 pt-4 border-t border-border-subtle">
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

            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 space-y-14">
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
              className="relative rounded-2xl border border-border-subtle bg-bg-secondary p-7 space-y-4 hover:border-primary/60 transition-all overflow-hidden group hover:shadow-xl hover:shadow-primary/8"
            >
              {/* Step number — large background watermark */}
              <span className="pointer-events-none absolute -top-4 -right-1 text-[100px] font-black leading-none select-none text-border-subtle/60 group-hover:text-primary/12 transition-colors duration-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Subtle glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-[40px]" />
              </div>

              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                <step.Icon size={22} />
              </div>
              <div className="relative space-y-1.5">
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
          <div className="relative rounded-2xl border border-dashed border-border-subtle overflow-hidden px-6 py-20 text-center space-y-4">
            {/* Background texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
            </div>
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
                <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="5" fill="none"/>
                <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="relative">
              <p className="font-semibold text-white">No products yet</p>
              <p className="mt-1.5 text-sm text-text-secondary">Be the first seller — open a store and list your products.</p>
            </div>
            <Link
              href="/seller/stores"
              className="relative inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-indigo-700 p-10 sm:p-14">
          {/* Dot grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Glow accents */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-[60px]" />

          <div className="relative grid sm:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">For sellers</p>
              <h2 className="text-3xl font-bold leading-snug text-white">
                Start selling in minutes, not days.
              </h2>
              <p className="text-white/70 leading-relaxed text-sm">
                No application, no approval, no fees. Connect your wallet, create a store, and start earning crypto immediately.
              </p>
            </div>
            <div className="flex sm:justify-end gap-3 flex-wrap">
              <Link
                href="/seller/stores"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-opacity shadow-xl text-sm"
              >
                Open a store <FiArrowRight size={16} />
              </Link>
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all text-sm"
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
