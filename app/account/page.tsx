"use client";

import { usersService } from "@/api";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { logout, setUser } from "@/redux/slices/auth-slice";
import { RootState, useAppDispatch } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  FirstName: z.string().min(1, "First name is required"),
  LastName: z.string().min(1, "Last name is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AccountPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const wallet = useWallet();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      FirstName: "",
      LastName: "",
    },
  });

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.replace("/auth/login?next=/account");
      return;
    }

    if (auth.user) {
      reset({
        FirstName: auth.user.FirstName,
        LastName: auth.user.LastName,
      });
    }
  }, [auth.isLoggedIn, auth.user, reset, router]);

  const onSubmit = handleSubmit(async (values) => {
    const response = await usersService.updateUser({
      ...values,
      Email: auth.user?.Email ?? "",
      WalletAddress: auth.user?.WalletAddress ?? "",
    });
    dispatch(setUser(response.data));
    toast.success("Account updated");
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-32 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Account</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Update your marketplace profile.
            </p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" error={errors.FirstName?.message}>
                <Input id="firstName" {...register("FirstName")} error={errors.FirstName?.message} />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.LastName?.message}>
                <Input id="lastName" {...register("LastName")} error={errors.LastName?.message} />
              </Field>
            </div>

            <Field label="Wallet address" htmlFor="walletAddress" helper="Your connected wallet (identity).">
              <Input
                id="walletAddress"
                value={auth.user?.WalletAddress ?? ""}
                readOnly
                className="opacity-60 cursor-default"
              />
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" isLoading={isSubmitting}>
                Save changes
              </Button>
              <Link href="/auth/logout">
                <Button type="button" variant="ghost" onClick={() => dispatch(logout())}>
                  Logout
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Wallet status</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {wallet.connected ? wallet.account : "MetaMask is not connected in this browser."}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-text-secondary">Quick links</p>
            <div className="flex flex-col gap-2">
              <Link href="/orders" className="underline">
                Your orders
              </Link>
              <Link href="/seller/stores" className="underline">
                Seller dashboard
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
