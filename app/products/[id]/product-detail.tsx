"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import BucketImage from "@/app/components/image";
import Skeleton from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import Button from "@/components/ui/button";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AddCart from "../components/addCart";
import { FiArrowLeft, FiEdit2, FiShield } from "react-icons/fi";

export default function ProductDetail() {
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
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          action={
            <Button variant="secondary" onClick={() => router.back()} icon={<FiArrowLeft size={14} />}>
              Go back
            </Button>
          }
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton h={20} w={96} className="mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-vault-lg" />
          <div className="space-y-4 pt-2">
            <Skeleton h={16} w={80} />
            <Skeleton h={32} w="75%" />
            <Skeleton h={24} w="33%" />
            <div className="space-y-2 pt-2">
              <Skeleton h={12} w="100%" />
              <Skeleton h={12} w="83%" />
              <Skeleton h={12} w="66%" />
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
        className="inline-flex items-center gap-1.5 text-body text-vault-text-secondary hover:text-vault-text transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> {product.Store?.Name ?? "Store"}
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-vault-lg overflow-hidden border border-vault-border bg-vault-surface">
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
              className="inline-flex items-center gap-1.5 rounded-vault-full border border-vault-border bg-vault-surface px-3 py-1 text-label text-vault-text-secondary hover:border-vault-border-accent hover:text-vault-accent transition-colors"
            >
              {product.Store?.Name}
            </Link>
          </div>

          {/* Name + price */}
          <div className="space-y-2">
            <h1 className="text-h1 font-bold leading-tight text-vault-text">{product.Name}</h1>
            <p className="text-display-l font-bold text-vault-text">
              {product.Price} {product.Unit}
            </p>
          </div>

          {/* Escrow protection banner */}
          <div className="flex items-start gap-2.5 rounded-vault-md border border-vault-success/40 bg-vault-success-soft px-4 py-3">
            <FiShield size={16} className="mt-0.5 shrink-0 text-vault-success" />
            <p className="text-body text-vault-success">
              Protected by escrow. Your funds are released to the seller only after delivery —
              or instantly when you confirm receipt.
            </p>
          </div>

          {/* Description */}
          {product.Description && (
            <div className="border-t border-vault-border pt-4 space-y-2">
              <h2 className="text-title text-vault-text">About this item</h2>
              <p className="text-body text-vault-text-secondary leading-relaxed">
                {product.Description}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto">
            {isOwner ? (
              <Link
                href={`/seller/stores/${product.StoreID}/products/${product.ID}/edit`}
                className="inline-flex items-center gap-2 border border-vault-border text-vault-text font-semibold px-5 py-2.5 rounded-vault-md hover:border-vault-border-accent hover:bg-vault-surface transition-all text-body"
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
