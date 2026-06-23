"use client";

import { productsService, storesService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import { IStore } from "@/api/interfaces/stores";
import BucketImage from "@/app/components/image";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import Button from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiArrowLeft, FiEdit2, FiPackage, FiPlus, FiTrash2 } from "react-icons/fi";

export default function SellerStoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[] | null>(null);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    storesService.getStore(id).then((res) => setStore(res.data)).catch(() => setError(true));
    productsService
      .getProducts(id, "")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [id]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(productId);
    try {
      await productsService.deleteProduct(productId);
      setProducts((prev) => prev?.filter((p) => p.ID !== productId) ?? []);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <EmptyState
        title="Store not found"
        description="This store may have been removed."
        action={
          <Link href="/seller/stores">
            <Button variant="secondary" icon={<FiArrowLeft size={14} />}>Back to my stores</Button>
          </Link>
        }
      />
    );
  }

  if (!store || !products) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-vault-lg" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-vault-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store header */}
      <div>
        <Link
          href="/seller/stores"
          className="inline-flex items-center gap-1.5 text-body text-vault-text-secondary hover:text-vault-text transition-colors mb-6"
        >
          <FiArrowLeft size={14} /> My stores
        </Link>

        <div className="flex items-center justify-between gap-4 rounded-vault-lg border border-vault-border bg-vault-surface p-5">
          <div>
            <h1 className="text-h2 font-bold text-vault-text">{store.Name}</h1>
            <p className="text-body text-vault-text-tertiary mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} listed
            </p>
          </div>
          <Link
            href={`/seller/stores/${id}/products/new`}
            className="inline-flex items-center gap-2 bg-vault-accent text-vault-on-accent font-semibold px-4 py-2.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow text-body shrink-0"
          >
            <FiPlus size={14} /> Add product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<FiPackage size={24} />}
          title="No products yet"
          description="Add your first product to make this store shoppable."
          action={
            <Link href={`/seller/stores/${id}/products/new`}>
              <Button icon={<FiPlus size={14} />}>Add product</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.ID}
              className="rounded-vault-lg border border-vault-border bg-vault-surface overflow-hidden"
            >
              <Link href={`/products/${product.ID}`} className="block aspect-video overflow-hidden">
                <BucketImage
                  key={product.ID}
                  imageURL={product.ImageURL}
                  name={product.Name}
                  className="h-full w-full hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4 space-y-3">
                <div>
                  <Link
                    href={`/products/${product.ID}`}
                    className="font-semibold text-vault-text hover:text-vault-accent transition-colors"
                  >
                    {product.Name}
                  </Link>
                  <p className="text-body text-vault-accent font-medium mt-0.5">
                    {product.Price} {product.Unit}
                  </p>
                </div>
                <div className="flex gap-2 border-t border-vault-border pt-3">
                  <Link
                    href={`/seller/stores/${id}/products/${product.ID}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-vault-border text-body font-semibold py-2 rounded-vault-md text-vault-text hover:border-vault-border-accent hover:text-vault-accent transition-all"
                  >
                    <FiEdit2 size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.ID)}
                    disabled={deletingId === product.ID}
                    className="flex items-center justify-center gap-1.5 border border-vault-border text-body font-semibold px-3 py-2 rounded-vault-md text-vault-text hover:border-vault-danger hover:text-vault-danger transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete product"
                  >
                    {deletingId === product.ID ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-vault-border border-t-vault-danger" />
                    ) : (
                      <FiTrash2 size={13} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
