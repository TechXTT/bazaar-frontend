"use client";

import { storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { ScoreBadgeInline } from "@/app/stores/components/reputation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiSearch, FiShoppingBag } from "react-icons/fi";

function StoreAvatar({ name }: { name: string }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const hue = (name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6) * 60;
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-inner"
      style={{ background: `hsl(${hue}, 40%, 30%)`, border: `1px solid hsl(${hue}, 40%, 40%)` }}
    >
      {letter}
    </div>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState<IStore[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    storesService
      .getStores()
      .then((res) => setStores(res.data))
      .catch(() => setError(true));
  }, []);

  const filtered = useMemo(() => {
    if (!stores) return null;
    if (!query.trim()) return stores;
    const q = query.toLowerCase();
    return stores.filter((s) => s.Name.toLowerCase().includes(q));
  }, [stores, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative py-20">
        {/* Blobs isolated so they don't clip the text */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/30 blur-[130px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-violet-500/20 blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="relative text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1 text-xs text-text-secondary">
            <FiShoppingBag size={12} />
            Independent sellers · Escrow-protected
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Discover Stores</h1>
          <p className="text-text-secondary max-w-md mx-auto text-sm leading-relaxed">
            Browse stores from independent sellers. Every purchase is protected by on-chain escrow.
          </p>

          {/* Search */}
          <div className="relative mx-auto max-w-md">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stores…"
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary py-3 pl-11 pr-4 text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {!stores && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-24">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="pb-24 text-center">
          <p className="text-text-secondary text-sm">Failed to load stores. Try refreshing.</p>
        </div>
      )}

      {/* Empty */}
      {stores && stores.length === 0 && (
        <div className="pb-24">
          <div className="relative rounded-2xl border border-dashed border-border-subtle overflow-hidden px-6 py-24 text-center space-y-5">
            {/* Dot grid texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
            {/* Center glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-56 rounded-full bg-primary/22 blur-[70px]" />
            </div>
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10">
              <FiShoppingBag size={28} />
            </div>
            <div className="relative">
              <p className="font-semibold text-white text-lg">No stores yet</p>
              <p className="mt-2 text-sm text-text-secondary max-w-xs mx-auto">Be the first to open one and start selling to the world with zero fees.</p>
            </div>
            <Link
              href="/seller/stores"
              className="relative inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
            >
              Open a store <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* No search results */}
      {filtered && filtered.length === 0 && stores && stores.length > 0 && (
        <div className="pb-24 text-center py-16">
          <p className="text-text-secondary text-sm">No stores match &ldquo;{query}&rdquo;.</p>
          <button onClick={() => setQuery("")} className="mt-2 text-sm text-primary hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-24">
          {filtered.map((store) => (
            <Link key={store.ID} href={`/stores/${store.ID}`} className="group">
              <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-5 hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all">
                <StoreAvatar name={store.Name} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold truncate group-hover:text-white transition-colors">
                    {store.Name}
                  </h2>
                  <div className="mt-1">
                    <ScoreBadgeInline score={store.Reputation?.Score ?? null} />
                  </div>
                </div>
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-muted group-hover:border-primary group-hover:text-primary transition-all">
                  <FiArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      {stores && stores.length > 0 && (
        <div className="pb-24">
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-white">Want to sell on The Bazaar?</p>
              <p className="mt-1 text-sm text-text-secondary">No fees, no approval — open a store in seconds.</p>
            </div>
            <Link
              href="/seller/stores"
              className="shrink-0 inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              Open a store <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
