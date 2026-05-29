"use client";

import { productsService } from "@/api";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UUID } from "crypto";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FiArrowLeft, FiCheck, FiImage } from "react-icons/fi";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name is too long"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  description: z.string().max(2000, "Description is too long"),
  image: z
    .custom<File>((value) => value instanceof File, "Image is required")
    .refine((file) => file.size < 10_000_000, "Image must be smaller than 10MB"),
});

type FormValues = z.infer<typeof schema>;

export default function SellerNewProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [preview, setPreview] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0, description: "" },
  });

  const image = watch("image");

  useEffect(() => {
    if (!(image instanceof File)) return;
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await productsService.createProduct({
        Name: values.name,
        Price: String(values.price),
        Description: values.description,
        Image: values.image,
        StoreID: id as UUID,
      });
      toast.success("Product created");
      router.push(`/seller/stores/${id}`);
    } catch {
      toast.error("Failed to create product");
    }
  });

  return (
    <div>
      <Link
        href={`/seller/stores/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> Back to store
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold">Add product</h1>
            <p className="text-sm text-text-secondary mt-1">Fill in the details for your new listing.</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <Field label="Name" htmlFor="name" error={errors.name?.message}>
              <Input
                id="name"
                placeholder="Product name"
                {...register("name")}
                error={errors.name?.message}
              />
            </Field>
            <Field label="Price (ETH)" htmlFor="price" error={errors.price?.message}>
              <Input
                id="price"
                type="number"
                step="0.0001"
                placeholder="0.0000"
                {...register("price")}
                error={errors.price?.message}
              />
            </Field>
            <Field label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea
                id="description"
                placeholder="Describe your product…"
                {...register("description")}
                error={errors.description?.message}
              />
            </Field>
            <Field label="Image" htmlFor="image" error={errors.image?.message as string | undefined}>
              <label className="flex items-center gap-3 rounded-xl border border-border-subtle px-4 py-3 cursor-pointer hover:border-primary transition-colors">
                <FiImage size={16} className="text-text-muted shrink-0" />
                <span className="text-sm text-text-secondary flex-1 truncate">
                  {image instanceof File ? image.name : "Choose an image…"}
                </span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setValue("image", file, { shouldValidate: true });
                  }}
                />
              </label>
            </Field>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FiCheck size={14} />
              )}
              Create product
            </button>
          </form>
        </div>

        {/* Image preview */}
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-3 h-fit">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Preview</p>
          {preview ? (
            <Image
              src={preview}
              alt="Product preview"
              width={320}
              height={320}
              className="h-64 w-full rounded-xl object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-sunken text-sm text-text-muted">
              Image will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
