"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { RootState } from "@/redux/store";
import { getErrorMessage } from "@/utils/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import { FiArrowLeft, FiCheck, FiImage } from "react-icons/fi";
import Skeleton from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name is too long"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  description: z.string().max(2000, "Description is too long"),
});

type FormValues = z.infer<typeof schema>;

export default function SellerEditProductPage() {
  const { id: storeId, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();
  const jwt = useSelector((state: RootState) => state.auth.jwt);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [newImage, setNewImage] = useState<File | undefined>();
  const [preview, setPreview] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    productsService
      .getProduct(productId)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        reset({ name: p.Name, price: p.Price, description: p.Description });
      })
      .catch(() => toast.error("Failed to load product"));
  }, [productId]);

  useEffect(() => {
    if (!newImage) return;
    const url = URL.createObjectURL(newImage);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newImage]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const update: Partial<IProduct> = {
        Name: values.name,
        Price: values.price,
        Description: values.description,
      };

      // If the seller picked a new image, upload it first and persist the URL.
      if (newImage) {
        const formData = new FormData();
        formData.append("file", newImage);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const { url } = await uploadRes.json();
        if (url) update.ImageURL = url;
      }

      await productsService.updateProduct(productId, update);
      toast.success("Product updated");
      router.push(`/seller/stores/${storeId}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update product"));
    }
  });

  if (!product) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Skeleton className="h-80 rounded-vault-lg" />
        <Skeleton className="h-64 rounded-vault-lg" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/seller/stores/${storeId}`}
        className="inline-flex items-center gap-1.5 text-body text-vault-text-secondary hover:text-vault-text transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> Back to store
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-6 space-y-6">
          <div>
            <h1 className="text-h2 font-bold text-vault-text">Edit product</h1>
            <p className="text-body text-vault-text-secondary mt-1">Update the details for this listing.</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <Field label="Name" htmlFor="name" error={errors.name?.message}>
              <Input id="name" {...register("name")} error={errors.name?.message} />
            </Field>
            <Field label="Price (ETH)" htmlFor="price" error={errors.price?.message}>
              <Input
                id="price"
                type="number"
                step="0.0001"
                {...register("price")}
                error={errors.price?.message}
              />
            </Field>
            <Field label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea
                id="description"
                {...register("description")}
                error={errors.description?.message}
              />
            </Field>
            <Field label="Replace image (optional)">
              <label className="flex items-center gap-3 rounded-vault-md border border-vault-border px-4 py-3 cursor-pointer hover:border-vault-border-accent transition-colors">
                <FiImage size={16} className="text-vault-text-tertiary shrink-0" />
                <span className="text-body text-vault-text-secondary flex-1 truncate">
                  {newImage ? newImage.name : "Choose a new image…"}
                </span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setNewImage(file);
                  }}
                />
              </label>
            </Field>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-vault-accent text-vault-on-accent font-semibold px-5 py-2.5 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow disabled:opacity-50 disabled:cursor-not-allowed text-body"
              >
                {isSubmitting ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FiCheck size={14} />
                )}
                Save changes
              </button>
              <button
                type="button"
                onClick={() => router.push(`/seller/stores/${storeId}`)}
                className="inline-flex items-center gap-2 border border-vault-border text-vault-text font-semibold px-5 py-2.5 rounded-vault-md hover:border-vault-border-accent transition-all text-body"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Image preview */}
        <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-3 h-fit">
          <p className="text-overline uppercase text-vault-text-tertiary">Preview</p>
          {preview || product.ImageURL ? (
            <Image
              src={preview || product.ImageURL}
              alt={product.Name}
              width={320}
              height={320}
              className="h-64 w-full rounded-vault-md object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-vault-md border border-dashed border-vault-border bg-vault-inset text-body text-vault-text-tertiary">
              No image selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
