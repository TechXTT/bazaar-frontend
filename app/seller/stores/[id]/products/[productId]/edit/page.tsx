"use client";

import { productsService } from "@/api";
import { IProduct } from "@/api/interfaces/products";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name is too long"),
  price: z.coerce.number().positive("Price must be greater than zero"),
  description: z.string().max(2000, "Description is too long"),
});

type FormValues = z.infer<typeof schema>;

export default function SellerEditProductPage() {
  const { id: storeId, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();
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
      await productsService.updateProduct(productId, {
        Name: values.name,
        Price: values.price,
        Description: values.description,
      });
      toast.success("Product updated");
      router.push(`/seller/stores/${storeId}`);
    } catch {
      toast.error("Failed to update product");
    }
  });

  if (!product) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} error={errors.name?.message} />
          </Field>
          <Field label="Price" htmlFor="price" error={errors.price?.message}>
            <Input id="price" type="number" step="0.0001" {...register("price")} error={errors.price?.message} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" {...register("description")} error={errors.description?.message} />
          </Field>
          <Field label="Replace image (optional)">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setNewImage(file);
              }}
            />
          </Field>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              Save changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/seller/stores/${storeId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Preview</h2>
        {preview || product.ImageURL ? (
          <Image
            src={preview || product.ImageURL}
            alt={product.Name}
            width={320}
            height={320}
            className="mt-4 h-80 w-full rounded-md object-cover"
            unoptimized
          />
        ) : (
          <div className="mt-4 flex h-80 items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-sunken text-sm text-text-secondary">
            No image selected.
          </div>
        )}
      </Card>
    </div>
  );
}
