"use client";

import { storesService } from "@/api";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { RootState } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import { FiArrowLeft, FiCheck, FiShoppingBag } from "react-icons/fi";
import { getErrorMessage } from "@/utils/helpers";

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
    try {
      const response = await storesService.createStore(values.name);
      toast.success("Store created");
      router.push(`/seller/stores/${response.data.ID}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create store"));
    }
  });

  return (
    <div className="max-w-lg">
      <Link
        href="/seller/stores"
        className="inline-flex items-center gap-1.5 text-body text-vault-text-secondary hover:text-vault-text transition-colors mb-8"
      >
        <FiArrowLeft size={14} /> My stores
      </Link>

      <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-vault-md bg-vault-accent-soft border border-vault-border-accent">
            <FiShoppingBag size={18} className="text-vault-accent" />
          </div>
          <div>
            <h1 className="text-h2 font-bold text-vault-text">Create store</h1>
            <p className="text-body text-vault-text-secondary">Set up a new storefront.</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="Store name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="e.g. Acme Electronics"
              {...register("name")}
              error={errors.name?.message}
            />
          </Field>
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
            Create store
          </button>
        </form>
      </div>
    </div>
  );
}
