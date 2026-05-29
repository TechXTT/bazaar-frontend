"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AddCart from "../components/addCart";
import { FiArrowLeft, FiEdit2, FiShield } from "react-icons/fi";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    productsService
      .getProduct(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-center space-y-2">
          <p className="font-semibold text-white">Product not found</p>
          <p className="text-sm text-text-secondary">This product may have been removed.</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-5 w-24 rounded bg-bg-secondary animate-pulse mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-bg-secondary animate-pulse" />
          <div className="space-y-4 pt-2">
            <div className="h-4 w-20 rounded bg-bg-secondary animate-pulse" />
            <div className="h-8 w-3/4 rounded bg-bg-secondary animate-pulse" />
            <div className="h-6 w-1/3 rounded bg-bg-secondary animate-pulse" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full rounded bg-bg-secondary animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-bg-secondary animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-bg-secondary animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = auth.user?.ID === product.Store?.OwnerID;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href={`/stores/${product.StoreID}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> {product.Store?.Name ?? "Store"}
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-border-subtle">
          <BucketImage
            key={product.ID}
            className="h-full w-full"
            imageURL={product.ImageURL}
            name={product.Name}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          {/* Store link */}
          <div>
            <Link
              href={`/stores/${product.StoreID}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              {product.Store?.Name}
            </Link>
          </div>

          {/* Name + price */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight">{product.Name}</h1>
            <p className="text-2xl font-semibold text-primary">
              {product.Price} {product.Unit}
            </p>
          </div>

          {/* Description */}
          {product.Description && (
            <p className="text-sm text-text-secondary leading-relaxed border-t border-border-subtle pt-4">
              {product.Description}
            </p>
          )}

          {/* Escrow trust indicator */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <FiShield size={13} className="text-primary shrink-0" />
            Escrowed payment — funds released on delivery confirmation
          </div>

          {/* CTA */}
          <div className="mt-auto">
            {isOwner ? (
              <Link
                href={`/seller/stores/${product.StoreID}/products/${product.ID}/edit`}
                className="inline-flex items-center gap-2 border border-border-subtle font-semibold px-5 py-2.5 rounded-xl hover:border-primary hover:bg-bg-secondary transition-all text-sm"
              >
                <FiEdit2 size={14} /> Edit product
              </Link>
            ) : (
              <AddCart product={product} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
