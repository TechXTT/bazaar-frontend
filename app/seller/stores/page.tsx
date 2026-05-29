"use client";

import { storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiArrowRight, FiPlus, FiShoppingBag } from "react-icons/fi";

function StoreAvatar({ name }: { name: string }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? "?";
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
      style={{ background: `hsl(${hue},55%,40%)` }}
    >
      {letter}
    </div>
  );
}

export default function SellerStoresPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [stores, setStores] = useState<IStore[] | null>(null);

  useEffect(() => {
    if (auth.isLoggedIn) {
      storesService.getUserStores().then((res) => setStores(res.data));
    }
  }, [auth.isLoggedIn, auth.jwt]);

  if (!stores) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My stores</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage storefronts and product catalogs.
          </p>
        </div>
        <Link
          href="/seller/stores/new"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm"
        >
          <FiPlus size={15} /> New store
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-5 rounded-2xl border border-dashed border-border-subtle">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary border border-border-subtle">
            <FiShoppingBag size={24} className="text-text-muted" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-white">No stores yet</p>
            <p className="text-sm text-text-secondary">
              Create your first store to start listing products.
            </p>
          </div>
          <Link
            href="/seller/stores/new"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm"
          >
            <FiPlus size={14} /> Create store
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.ID}
              className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-4"
            >
              <StoreAvatar name={store.Name} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{store.Name}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {store.Products?.length ?? 0} product{(store.Products?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href={`/seller/stores/${store.ID}`}
                className="inline-flex items-center gap-1.5 border border-border-subtle text-sm font-semibold px-4 py-2 rounded-xl hover:border-primary hover:text-primary transition-all shrink-0"
              >
                Manage <FiArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
