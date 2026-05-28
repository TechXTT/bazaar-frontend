"use client";

import { storesService } from "@/api";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
});

type FormValues = z.infer<typeof schema>;

export default function SellerNewStorePage() {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await storesService.createStore(values, auth.jwt || "");
    toast.success("Store created");
    router.push(`/seller/stores/${response.data.ID}`);
  });

  return (
    <Card className="max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Create store</h1>
      <p className="mt-2 text-sm text-text-secondary">Create a storefront for your product listings.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <Field label="Store name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} error={errors.name?.message} />
        </Field>
        <Button type="submit" isLoading={isSubmitting}>
          Create store
        </Button>
      </form>
    </Card>
  );
}
