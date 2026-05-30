"use client";

import { productsService, storesService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import { IStore } from "@/api/interfaces/stores";
import BucketImage from "@/app/components/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiArrowLeft, FiEdit2, FiPackage, FiPlus, FiTrash2 } from "react-icons/fi";

export default function SellerStoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[] | null>(null);

  useEffect(() => {
    storesService.getStore(id).then((res) => setStore(res.data));
    productsService
      .getProducts(id, "")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
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
        <div className="h-24 rounded-2xl bg-bg-secondary animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-bg-secondary animate-pulse" />
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
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-6"
        >
          <FiArrowLeft size={14} /> My stores
        </Link>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-5">
          <div>
            <h1 className="text-xl font-bold text-white">{store.Name}</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} listed
            </p>
          </div>
          <Link
            href={`/seller/stores/${id}/products/new`}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm shrink-0"
          >
            <FiPlus size={14} /> Add product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border-subtle space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary border border-border-subtle">
            <FiPackage size={24} className="text-text-muted" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-white">No products yet</p>
            <p className="text-sm text-text-secondary">
              Add your first product to make this store shoppable.
            </p>
          </div>
          <Link
            href={`/seller/stores/${id}/products/new`}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 text-sm"
          >
            <FiPlus size={14} /> Add product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.ID}
              className="rounded-2xl border border-border-subtle bg-bg-secondary overflow-hidden"
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
                    className="font-semibold text-white hover:text-primary transition-colors"
                  >
                    {product.Name}
                  </Link>
                  <p className="text-sm text-primary font-medium mt-0.5">
                    {product.Price} {product.Unit}
                  </p>
                </div>
                <div className="flex gap-2 border-t border-border-subtle pt-3">
                  <Link
                    href={`/seller/stores/${id}/products/${product.ID}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-border-subtle text-sm font-semibold py-2 rounded-xl hover:border-primary hover:text-primary transition-all"
                  >
                    <FiEdit2 size={13} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.ID)}
                    className="flex items-center justify-center gap-1.5 border border-border-subtle text-sm font-semibold px-3 py-2 rounded-xl hover:border-red-400 hover:text-red-400 transition-all"
                    aria-label="Delete product"
                  >
                    <FiTrash2 size={13} />
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
