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
      className="flex items-center gap-2 w-full rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 text-left hover:border-primary transition-colors group"
    >
      <span className="flex-1 font-mono text-xs text-text-secondary truncate">{address}</span>
      {copied ? (
        <FiCheck size={14} className="shrink-0 text-green-400" />
      ) : (
        <FiCopy size={14} className="shrink-0 text-text-muted group-hover:text-primary transition-colors" />
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
      const response = await usersService.updateUser({
        ...values,
        Email: auth.user?.Email ?? "",
        WalletAddress: auth.user?.WalletAddress ?? "",
      });
      dispatch(setUser(response.data));
      toast.success("Account updated");
    } catch {
      toast.error("Failed to save changes");
    }
  });

  const initials =
    `${auth.user?.FirstName?.[0] ?? ""}${auth.user?.LastName?.[0] ?? ""}`.toUpperCase() || "?";

  const hue =
    ((auth.user?.FirstName ?? "") + (auth.user?.LastName ?? ""))
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Avatar header */}
      <div className="flex items-center gap-5 mb-10">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg"
          style={{ background: `hsl(${hue},55%,42%)` }}
        >
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {auth.user?.FirstName
              ? `${auth.user.FirstName} ${auth.user.LastName}`
              : "Your account"}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {wallet.connected ? "Wallet connected" : "Wallet not connected"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Profile form */}
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-6 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
              Profile
            </p>
            <p className="text-sm text-text-secondary">Update your display name.</p>
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
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                className="inline-flex items-center gap-2 border border-border-subtle font-semibold px-5 py-2.5 rounded-xl hover:border-red-400 hover:text-red-400 transition-all text-sm"
              >
                <FiLogOut size={14} /> Sign out
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Wallet status */}
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Wallet
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${wallet.connected ? "bg-green-400" : "bg-red-400"}`}
              />
              <span className="text-sm font-medium text-white">
                {wallet.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            {wallet.connected && wallet.account && (
              <WalletAddress address={wallet.account} />
            )}
            {!wallet.connected && (
              <p className="text-xs text-text-muted">
                Open MetaMask in your browser to connect.
              </p>
            )}
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
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
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-white transition-all group"
                >
                  <Icon size={15} className="text-text-muted group-hover:text-primary transition-colors" />
                  <span className="flex-1">{label}</span>
                  <FiArrowRight size={13} className="text-text-muted group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
