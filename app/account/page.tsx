"use client";

import { usersService } from "@/api";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { logout, setUser } from "@/redux/slices/auth-slice";
import { RootState, useAppDispatch } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";
import {
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiLogOut,
  FiPackage,
  FiShoppingBag,
  FiUser,
  FiZap,
} from "react-icons/fi";

const schema = z.object({
  FirstName: z.string().min(1, "First name is required"),
  LastName: z.string().min(1, "Last name is required"),
});

type FormValues = z.infer<typeof schema>;

function WalletAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-2 w-full rounded-vault-md border border-vault-border bg-vault-inset px-4 py-3 text-left hover:border-vault-border-accent transition-colors group"
    >
      <span className="flex-1 font-mono text-caption text-vault-text-secondary truncate">{address}</span>
      {copied ? (
        <FiCheck size={14} className="shrink-0 text-vault-success" />
      ) : (
        <FiCopy size={14} className="shrink-0 text-vault-text-tertiary group-hover:text-vault-accent transition-colors" />
      )}
    </button>
  );
}

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
    defaultValues: { FirstName: "", LastName: "" },
  });

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.replace("/auth/login?next=/account");
      return;
    }
    usersService.getMe()
      .then((res) => {
        if (res.status === 200) {
          dispatch(setUser(res.data));
          reset({ FirstName: res.data.FirstName, LastName: res.data.LastName });
        }
      })
      .catch(() => dispatch(logout()));
  }, [auth.isLoggedIn]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await usersService.updateUser({
        ...values,
        Email: auth.user?.Email ?? "",
        WalletAddress: auth.user?.WalletAddress ?? "",
      });
      const refreshed = await usersService.getMe();
      if (refreshed.status === 200) {
        dispatch(setUser(refreshed.data));
        reset({ FirstName: refreshed.data.FirstName, LastName: refreshed.data.LastName });
      }
      toast.success("Account updated");
    } catch {
      toast.error("Failed to save changes");
    }
  });

  const initials =
    `${auth.user?.FirstName?.[0] ?? ""}${auth.user?.LastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Avatar header */}
      <div className="flex items-center gap-5 mb-10">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-vault-lg bg-gradient-to-br from-vault-accent to-vault-violet text-h2 font-bold text-vault-on-accent shadow-vault-card">
          {initials}
        </div>
        <div>
          <h1 className="text-h1 font-bold text-vault-text">
            {auth.user?.FirstName
              ? `${auth.user.FirstName} ${auth.user.LastName}`
              : "Your account"}
          </h1>
          <p className="text-body text-vault-text-secondary mt-0.5">
            {wallet.connected ? "Wallet connected" : "Wallet not connected"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Profile form */}
        <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-6 space-y-6">
          <div>
            <p className="text-overline uppercase text-vault-text-tertiary mb-1">
              Profile
            </p>
            <p className="text-body text-vault-text-secondary">Update your display name.</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName" error={errors.FirstName?.message}>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  {...register("FirstName")}
                  error={errors.FirstName?.message}
                />
              </Field>
              <Field label="Last name" htmlFor="lastName" error={errors.LastName?.message}>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("LastName")}
                  error={errors.LastName?.message}
                />
              </Field>
            </div>

            <Field
              label="Wallet address"
              htmlFor="walletAddress"
              helper="Your on-chain identity — cannot be changed."
            >
              {auth.user?.WalletAddress ? (
                <WalletAddress address={auth.user.WalletAddress} />
              ) : (
                <Input
                  id="walletAddress"
                  value=""
                  readOnly
                  placeholder="Not connected"
                  className="opacity-50 cursor-default"
                />
              )}
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
                onClick={() => { dispatch(logout()); router.push("/auth/login"); }}
                className="inline-flex items-center gap-2 border border-vault-border text-vault-text font-semibold px-5 py-2.5 rounded-vault-md hover:border-vault-danger hover:text-vault-danger transition-all text-body"
              >
                <FiLogOut size={14} /> Sign out
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Wallet status */}
          <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-3">
            <p className="text-overline uppercase text-vault-text-tertiary">
              Wallet
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${wallet.connected ? "bg-vault-success" : "bg-vault-danger"}`}
              />
              <span className="text-body-strong text-vault-text">
                {wallet.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            {wallet.connected && wallet.account && (
              <WalletAddress address={wallet.account} />
            )}
            {!wallet.connected && (
              <p className="text-caption text-vault-text-tertiary">
                Open MetaMask in your browser to connect.
              </p>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-vault-lg border border-vault-border bg-vault-surface p-5 space-y-3">
            <p className="text-overline uppercase text-vault-text-tertiary">
              Quick links
            </p>
            <div className="space-y-1">
              {[
                { href: "/orders", Icon: FiPackage, label: "My orders" },
                { href: "/seller/stores", Icon: FiShoppingBag, label: "Seller dashboard" },
                { href: "/stores", Icon: FiZap, label: "Browse stores" },
              ].map(({ href, Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-vault-md px-3 py-2.5 text-body text-vault-text-secondary hover:bg-vault-surface-2 hover:text-vault-text transition-all group"
                >
                  <Icon size={15} className="text-vault-text-tertiary group-hover:text-vault-accent transition-colors" />
                  <span className="flex-1">{label}</span>
                  <FiArrowRight size={13} className="text-vault-text-tertiary group-hover:text-vault-accent transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
