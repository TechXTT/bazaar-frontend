"use client";

import { productsService, storesService } from "@/api";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import Skeleton from "@/components/ui/skeleton";
import { IProduct } from "@/api/interfaces/products";
import { IStore } from "@/api/interfaces/stores";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerStoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const [storeResponse, productsResponse] = await Promise.all([
        storesService.getStore(id),
        productsService.getProducts(id, ""),
      ]);
      setStore(storeResponse.data);
      setProducts(productsResponse.data);
    };

    load();
  }, [id]);

  if (!store || !products) {
    return (
      <div className="space-y-4">
        <Skeleton h={120} />
        <Skeleton h={120} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{store.Name}</h1>
          <p className="mt-2 text-sm text-text-secondary">
            {products.length} product{products.length === 1 ? "" : "s"} listed.
          </p>
        </div>
        <Link href={`/seller/stores/${id}/products/new`}>
          <Button>Add product</Button>
        </Link>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to make this store shoppable."
          action={
            <Link href={`/seller/stores/${id}/products/new`}>
              <Button>Add product</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Link key={product.ID} href={`/products/${product.ID}`}>
              <Card className="space-y-2 transition hover:bg-surface-hover">
                <h2 className="font-semibold">{product.Name}</h2>
                <p className="text-sm text-text-secondary">
                  {product.Price} {product.Unit}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
