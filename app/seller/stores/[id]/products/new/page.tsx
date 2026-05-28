"use client";

import { productsService } from "@/api";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UUID } from "crypto";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

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
  const auth = useSelector((state: RootState) => state.auth);
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
    defaultValues: {
      name: "",
      price: 0,
      description: "",
    },
  });

  const image = watch("image");

  useEffect(() => {
    if (!(image instanceof File)) return;
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const onSubmit = handleSubmit(async (values) => {
    await productsService.createProduct(
      {
        Name: values.name,
        Price: String(values.price),
        Description: values.description,
        Image: values.image,
        StoreID: id as UUID,
      },
      auth.jwt || ""
    );
    toast.success("Product created");
    router.push(`/seller/stores/${id}`);
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Add product</h1>
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
          <Field label="Image" htmlFor="image" error={errors.image?.message as string | undefined}>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setValue("image", file, { shouldValidate: true });
                }
              }}
            />
          </Field>
          <Button type="submit" isLoading={isSubmitting}>
            Create product
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Preview</h2>
        {preview ? (
          <Image
            src={preview}
            alt="Product preview"
            width={320}
            height={320}
            className="mt-4 h-80 w-full rounded-md object-cover"
            unoptimized
          />
        ) : (
          <div className="mt-4 flex h-80 items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-sunken text-sm text-text-secondary">
            Select an image to preview it here.
          </div>
        )}
      </Card>
    </div>
  );
}
