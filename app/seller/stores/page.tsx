"use client";

import { storesService } from "@/api";
import { IStore } from "@/api/interfaces/stores";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import Button from "@/components/ui/button";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiArrowRight, FiPlus, FiShoppingBag } from "react-icons/fi";

function StoreAvatar({ name }: { name: string }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-vault-md bg-gradient-to-br from-vault-accent to-vault-violet text-h3 font-bold text-vault-on-accent">
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
          <Skeleton key={i} className="h-24 rounded-vault-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-vault-text">My stores</h1>
          <p className="mt-1 text-body text-vault-text-secondary">
            Manage storefronts and product catalogs.
          </p>
        </div>
        <Link
          href="/seller/stores/new"
          className="inline-flex items-center gap-2 bg-vault-accent text-vault-on-accent font-semibold px-4 py-2.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow text-body"
        >
          <FiPlus size={15} /> New store
        </Link>
      </div>

      {stores.length === 0 ? (
        <EmptyState
          icon={<FiShoppingBag size={28} />}
          title="No stores yet"
          description="Create your first store to start listing products."
          action={
            <Link href="/seller/stores/new">
              <Button icon={<FiPlus size={14} />}>Create store</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.ID}
              className="flex items-center gap-4 rounded-vault-lg border border-vault-border bg-vault-surface p-4"
            >
              <StoreAvatar name={store.Name} />
              <div className="flex-1 min-w-0">
                <p className="text-title text-vault-text">{store.Name}</p>
                <p className="text-caption text-vault-text-tertiary mt-0.5">
                  {store.Products?.length ?? 0} product{(store.Products?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href={`/seller/stores/${store.ID}`}
                className="inline-flex items-center gap-1.5 border border-vault-border text-body font-semibold px-4 py-2 rounded-vault-md text-vault-text hover:border-vault-border-accent hover:text-vault-accent transition-all shrink-0"
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
