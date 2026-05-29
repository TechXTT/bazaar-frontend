"use client";

import { storesService } from "@/api";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Skeleton from "@/components/ui/skeleton";
import { IStore } from "@/api/interfaces/stores";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function SellerStoresPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [stores, setStores] = useState<IStore[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await storesService.getUserStores();
      setStores(response.data);
    };

    if (auth.isLoggedIn) {
      load();
    }
  }, [auth.isLoggedIn, auth.jwt]);

  if (!stores) {
    return (
      <div className="space-y-3">
        <Skeleton h={120} />
        <Skeleton h={120} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My stores</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage storefronts and product catalogs from one place.
          </p>
        </div>
        <Link href="/seller/stores/new">
          <Button>Create store</Button>
        </Link>
      </div>

      {stores.length === 0 ? (
        <EmptyState
          title="No stores yet"
          description="Create your first store to start listing products."
          action={
            <Link href="/seller/stores/new">
              <Button>Create store</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.ID} className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold">{store.Name}</h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {store.Products?.length || 0} products
                </p>
              </div>
              <Link href={`/seller/stores/${store.ID}`}>
                <Button variant="secondary">Manage</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
