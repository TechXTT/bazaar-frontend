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
import { toast } from "sonner";

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

  const handleDelete = async (productId: string) => {
    try {
      await productsService.deleteProduct(productId);
      setProducts((prev) => prev?.filter((p) => p.ID !== productId) ?? []);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

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
            <Card key={product.ID} className="flex flex-col gap-3 p-4">
              <Link
                href={`/products/${product.ID}`}
                className="hover:underline"
              >
                <h2 className="font-semibold">{product.Name}</h2>
                <p className="text-sm text-text-secondary">
                  {product.Price} {product.Unit}
                </p>
              </Link>
              <div className="flex gap-2 border-t border-border-subtle pt-3">
                <Link
                  href={`/seller/stores/${id}/products/${product.ID}/edit`}
                  className="flex-1"
                >
                  <Button variant="secondary" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(product.ID)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
