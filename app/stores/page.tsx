"use client";

import { storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { ScoreBadgeInline } from "@/app/stores/components/reputation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiShoppingBag } from "react-icons/fi";

export default function StoresPage() {
  const [stores, setStores] = useState<IStore[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    storesService
      .getStores()
      .then((res) => setStores(res.data))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Stores</h1>
        <p className="mt-2 text-text-secondary text-sm">
          Browse independent sellers on The Bazaar.
        </p>
      </div>

      {!stores && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-text-secondary">
          Failed to load stores. Try refreshing.
        </p>
      )}

      {stores && stores.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-secondary px-6 py-16 text-center">
          <p className="font-semibold">No stores yet</p>
          <p className="mt-2 text-sm text-text-secondary">
            Be the first to open one.
          </p>
          <Link
            href="/seller/stores"
            className="mt-6 inline-block bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Open a store
          </Link>
        </div>
      )}

      {stores && stores.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link key={store.ID} href={`/stores/${store.ID}`}>
              <div className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-secondary p-5 hover:border-primary transition-all cursor-pointer">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-sunken border border-border-subtle">
                  <FiShoppingBag size={22} className="text-text-secondary group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold truncate group-hover:text-white transition-colors">
                    {store.Name}
                  </h2>
                  <div className="mt-1">
                    <ScoreBadgeInline score={store.Reputation?.Score ?? null} />
                  </div>
                </div>
                <div className="ml-auto text-text-secondary group-hover:text-primary transition-colors shrink-0">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
