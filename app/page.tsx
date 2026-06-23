"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import ProductCard from "@/app/stores/components/product";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import Button from "@/components/ui/button";
import { CONFIG } from "@/config/config";
import { formatFeeBps } from "@/utils/helpers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiShield, FiLock, FiUsers, FiArrowRight, FiShoppingBag } from "react-icons/fi";

const FEE_LABEL = formatFeeBps(CONFIG.PLATFORM_FEE_BPS);

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
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-vault-accent/20 blur-[90px]" />
        <div className="pointer-events-none absolute -inset-6 top-1/2 rounded-full bg-vault-violet/15 blur-[60px]" />

        {/* Main card — gradient border via wrapper */}
        <div className="relative rounded-vault-lg p-px bg-gradient-to-b from-vault-accent/40 via-vault-accent/10 to-transparent shadow-vault-card">
          <div className="rounded-[15px] bg-vault-surface overflow-hidden">
            {/* Image area */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-vault-accent/25 via-vault-surface to-vault-inset">
              {/* Faint grid backdrop */}
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #8b5cf6 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="absolute inset-0 grid grid-cols-2 gap-4 p-5">
                <div className="rounded-vault-md bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-vault bg-vault-accent/40" />
                </div>
                <div className="rounded-vault-md bg-vault-violet/15 border border-vault-violet/25 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-vault bg-vault-violet/30" />
                </div>
                <div className="rounded-vault-md bg-vault-violet/15 border border-vault-violet/25 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-vault bg-vault-violet/30" />
                </div>
                <div className="rounded-vault-md bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-vault bg-vault-accent/40" />
                </div>
              </div>
              {/* Store label */}
              <div className="absolute top-3 left-3 rounded-vault bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-white/10">
                <p className="text-caption font-semibold text-vault-text">TechStore Pro</p>
              </div>
              {/* Rating */}
              <div className="absolute top-3 right-3 rounded-vault bg-black/60 backdrop-blur-sm px-2 py-1 border border-white/10 flex items-center gap-1">
                <span className="text-vault-warning text-caption">★</span>
                <span className="text-caption font-semibold text-vault-text">4.9</span>
              </div>
            </div>

            {/* Product info */}
            <div className="p-4 space-y-3 border-t border-vault-border">
              <div>
                <p className="font-semibold text-vault-text">Hardware Wallet v3</p>
                <p className="text-caption text-vault-text-tertiary mt-0.5">Digital security device</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-vault-accent font-bold text-h3">0.042 ETH</span>
                <div className="bg-vault-accent text-vault-on-accent text-label font-semibold px-3 py-1.5 rounded-vault shadow-vault-glow">
                  Add to cart
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badge: Escrow protected */}
        <div className="absolute -bottom-4 -left-8 rounded-vault-md border border-vault-success/40 bg-vault-success-soft/90 backdrop-blur-sm px-3 py-2 shadow-vault-card animate-float-delayed">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-vault-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-vault-success" />
            </span>
            <span className="text-caption font-semibold text-vault-success">Escrow protected</span>
          </div>
        </div>

        {/* Floating badge: On-chain */}
        <div className="absolute -top-4 -right-6 rounded-vault-md border border-vault-border-accent bg-vault-accent-soft/90 backdrop-blur-sm px-3 py-2 shadow-vault-card">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-vault-accent opacity-75 animate-ping" style={{ animationDelay: "0.8s" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-vault-accent" />
            </span>
            <span className="text-caption font-semibold text-vault-accent">On-chain escrow</span>
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
    <main className="bg-vault-bg">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center">
        {/* Glow blobs — isolated so they don't clip the text */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/4 h-[700px] w-[900px] rounded-full bg-vault-accent/20 blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-vault-violet/15 blur-[140px]" />
          <div className="absolute top-1/3 -left-32 h-[400px] w-[500px] rounded-full bg-vault-accent/10 blur-[120px]" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, #8b5cf6 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-vault-full border border-vault-border-accent bg-vault-accent-soft px-4 py-1.5 text-label text-vault-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-vault-accent animate-pulse" />
                Powered by Ethereum · Open source
              </div>

              <h1 className="text-h1 sm:text-display-l lg:text-display-xl font-extrabold tracking-tight leading-[1.05] text-vault-text">
                The marketplace where{" "}
                <span className="bg-gradient-to-r from-vault-accent via-vault-violet to-vault-info bg-clip-text text-transparent">
                  every trade
                </span>{" "}
                is protected.
              </h1>

              <p className="text-body-l text-vault-text-secondary leading-relaxed max-w-md">
                Buy and sell anything with on-chain escrow protection and
                community-driven dispute resolution. No middlemen. No censorship.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-2 bg-vault-accent text-vault-on-accent font-semibold px-7 py-3.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow"
                >
                  Browse stores <FiArrowRight size={16} />
                </Link>
                <Link
                  href="/seller/stores"
                  className="inline-flex items-center gap-2 border border-vault-border text-vault-text font-semibold px-7 py-3.5 rounded-vault-md hover:border-vault-border-accent hover:bg-vault-surface transition-all"
                >
                  Open a store
                </Link>
              </div>

              <div className="flex flex-wrap gap-10 pt-4 border-t border-vault-border">
                {[
                  { value: "0", label: "Listing fees" },
                  { value: FEE_LABEL, label: "Flat fee per sale" },
                  { value: "24/7", label: "Always online" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-h2 font-bold text-vault-text">{s.value}</p>
                    <p className="text-caption text-vault-text-secondary mt-0.5">{s.label}</p>
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
          <p className="text-overline uppercase text-vault-accent">How it works</p>
          <h2 className="text-h1 font-bold text-vault-text">Trade with confidence</h2>
          <p className="text-vault-text-secondary max-w-md mx-auto text-body leading-relaxed">
            Smart contracts guarantee fairness. Every trade is protected from start to finish.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-vault-lg border border-vault-border bg-vault-surface p-7 space-y-4 hover:border-vault-border-accent transition-all overflow-hidden group hover:shadow-vault-card"
            >
              {/* Step number — large background watermark */}
              <span className="pointer-events-none absolute -top-4 -right-1 text-[100px] font-black leading-none select-none text-vault-border/60 group-hover:text-vault-accent/12 transition-colors duration-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Subtle glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-vault-accent/10 blur-[40px]" />
              </div>

              <div className="relative flex h-11 w-11 items-center justify-center rounded-vault-md bg-vault-accent-soft border border-vault-border-accent text-vault-accent group-hover:bg-vault-accent/20 transition-all">
                <step.Icon size={22} />
              </div>
              <div className="relative space-y-1.5">
                <h3 className="text-title text-vault-text">{step.title}</h3>
                <p className="text-body text-vault-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured products ─── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-h2 font-bold text-vault-text">Fresh from the Bazaar</h2>
            <p className="text-body text-vault-text-secondary">Hand-picked from stores on The Bazaar.</p>
          </div>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 text-body text-vault-text-secondary hover:text-vault-accent transition-colors"
          >
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-vault-lg border border-vault-border bg-vault-surface">
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton h={14} w="75%" />
                  <Skeleton h={20} w="40%" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyState
            title="Could not load products"
            description="Something went wrong fetching the latest listings. Try refreshing the page."
          />
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            icon={<FiShoppingBag size={28} />}
            title="No products yet"
            description="Be the first seller — open a store and list your products."
            action={
              <Link href="/seller/stores">
                <Button icon={<FiArrowRight size={14} />}>Open a store</Button>
              </Link>
            }
          />
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
        <div className="relative overflow-hidden rounded-vault-2xl bg-gradient-to-br from-vault-accent via-vault-violet to-vault-accent p-10 sm:p-14">
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
              <p className="text-overline uppercase text-vault-on-accent/60">For sellers</p>
              <h2 className="text-h1 font-bold leading-snug text-vault-on-accent">
                Start selling in minutes, not days.
              </h2>
              <p className="text-vault-on-accent/70 leading-relaxed text-body">
                No application, no approval, no listing fees — just a {FEE_LABEL} fee when you make a sale. Connect your wallet, create a store, and start earning crypto immediately.
              </p>
            </div>
            <div className="flex sm:justify-end gap-3 flex-wrap">
              <Link
                href="/seller/stores"
                className="inline-flex items-center gap-2 bg-white text-vault-accent font-bold px-7 py-3.5 rounded-vault-md hover:bg-white/90 transition-opacity shadow-xl text-body"
              >
                Open a store <FiArrowRight size={16} />
              </Link>
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-vault-md hover:bg-white/10 transition-all text-body"
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
