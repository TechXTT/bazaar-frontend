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
      storesService
        .getUserStores()
        .then((res) => setStores(res.data))
        .catch(() => setStores([]));
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
        <div className="relative flex flex-col items-center justify-center py-24 space-y-5 rounded-2xl border border-dashed border-border-subtle overflow-hidden text-center">
          {/* Dot grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #8b7dff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          {/* Center glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-56 w-56 rounded-full bg-primary/15 blur-[70px]" />
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10">
            <FiShoppingBag size={28} />
          </div>
          <div className="relative">
            <p className="font-semibold text-white text-lg">No stores yet</p>
            <p className="mt-2 text-sm text-text-secondary max-w-xs mx-auto">
              Create your first store to start listing products.
            </p>
          </div>
          <Link
            href="/seller/stores/new"
            className="relative inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/30 text-sm"
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
