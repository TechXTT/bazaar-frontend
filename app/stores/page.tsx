"use client";

import { storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { ScoreBadgeInline } from "@/app/stores/components/reputation";
import Card from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Stores</h1>

      {!stores && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-text-secondary">Failed to load stores. Try refreshing the page.</p>
      )}

      {stores && stores.length === 0 && (
        <p className="text-text-secondary">No stores yet — be the first to open one.</p>
      )}

      {stores && stores.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link key={store.ID} href={`/stores/${store.ID}`}>
              <Card className="flex items-center justify-between gap-2 p-4 hover:border-primary transition-colors cursor-pointer">
                <h2 className="font-semibold truncate">{store.Name}</h2>
                <ScoreBadgeInline score={store.Reputation?.Score ?? null} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
