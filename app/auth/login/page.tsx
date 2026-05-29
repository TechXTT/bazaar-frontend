"use client";

import { usersService } from "@/api";
import { CONFIG } from "@/config/config";
import { login, setUser } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { useSDK } from "@metamask/sdk-react";
import { getAddress } from "ethers";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function buildSiweMessage(address: string, nonce: string): string {
  const domain = window.location.host;
  const origin = window.location.origin;
  const chainId = parseInt(CONFIG.CHAIN_ID, 16);
  const issuedAt = new Date().toISOString();

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to The Bazaar",
    "",
    `URI: ${origin}`,
    "Version: 1",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { sdk } = useSDK();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const accounts = await sdk?.connect();
      const walletAddress = (accounts as string[])?.[0];
      if (!walletAddress) throw new Error("No wallet connected");

      const nonceRes = await usersService.getNonce(walletAddress);
      const { nonce } = nonceRes.data;

      const checksumAddress = getAddress(walletAddress);
      const message = buildSiweMessage(checksumAddress, nonce);
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      const verifyRes = await usersService.verifySIWE(message, signature as string);
      const { token, user } = verifyRes.data;

      dispatch(login(token));
      dispatch(setUser(user));
      router.push("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data ??
        err?.message ??
        "Sign-in failed";
      const text = typeof msg === "string" ? msg : "Sign-in failed";
      setErrorMsg(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        {/* Brand mark */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-bg-secondary shadow-lg">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
              <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="5" fill="none"/>
              <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
              <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Sign in to The Bazaar</h1>
          <p className="text-sm text-text-secondary">
            Connect your wallet to buy, sell, and trade.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-8 space-y-5 shadow-xl">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 35 35" fill="none">
                <path d="M17.5 2.5C9.22 2.5 2.5 9.22 2.5 17.5S9.22 32.5 17.5 32.5 32.5 25.78 32.5 17.5 25.78 2.5 17.5 2.5z" fill="white" fillOpacity="0.2"/>
                <path d="M22.5 13.5C22.5 13.5 21 10 17.5 10S12.5 13.5 12.5 13.5L10 22.5H25L22.5 13.5z" fill="white"/>
              </svg>
            )}
            {loading ? "Connecting…" : "Sign in with MetaMask"}
          </button>

          {errorMsg && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-bg-secondary px-3 text-xs text-text-muted">
                how it works
              </span>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-text-secondary">
            {[
              "Your wallet is your account — no email or password",
              "Sign a one-time message to prove ownership",
              "A new account is created on first sign-in",
            ].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border-subtle flex items-center justify-center text-[9px] text-primary">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
