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
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <p className="text-text-secondary">Product not found.</p>
        <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-96 rounded-xl bg-bg-secondary" />
        <div className="h-8 w-64 rounded bg-bg-secondary" />
        <div className="h-5 w-40 rounded bg-bg-secondary" />
      </div>
    );
  }

  const isOwner = auth.user?.ID === product.Store?.OwnerID;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8 rounded-xl border border-border-subtle bg-bg-secondary p-6">
        {/* Image */}
        <div className="lg:w-1/2 shrink-0">
          <BucketImage
            key={product.ID}
            className="w-full h-80 lg:h-full object-cover rounded-lg"
            imageURL={product.ImageURL}
            name={product.Name}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 flex-1">
          <Link
            href={`/stores/${product.StoreID}`}
            className="text-sm text-primary hover:underline"
          >
            {product.Store?.Name}
          </Link>

          <h1 className="text-3xl font-bold">{product.Name}</h1>

          <p className="text-2xl font-semibold">
            {product.Price} {product.Unit}
          </p>

          {product.Description && (
            <p className="text-text-secondary text-sm leading-relaxed">
              {product.Description}
            </p>
          )}

          <div className="mt-auto">
            {isOwner ? (
              <Link
                href={`/seller/stores/${product.StoreID}/products/${product.ID}/edit`}
                className="inline-block bg-bg-secondary border border-border-subtle font-semibold px-5 py-2 rounded-lg hover:border-primary transition-colors text-sm"
              >
                Edit this product
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
