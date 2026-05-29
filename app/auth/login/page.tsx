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

const features = [
  { label: "Permissionless", desc: "No sign-up, no KYC" },
  { label: "Non-custodial", desc: "Funds held in contract" },
  { label: "Trustless", desc: "Community arbitration" },
];

const steps = [
  "Your wallet is your identity — no email or password",
  "Sign a one-time message to prove ownership",
  "A new account is created automatically on first sign-in",
];

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
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-[#0f1e21]">
        {/* Background glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
              <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="6" fill="none"/>
              <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-base tracking-widest uppercase text-white">The Bazaar</span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Built on Ethereum
          </div>
          <h2 className="text-5xl font-bold leading-tight text-white">
            Trade anything,<br />
            <span className="text-primary">trust no one.</span>
          </h2>
          <p className="text-base text-text-secondary max-w-xs leading-relaxed">
            A permissionless marketplace where smart contracts hold funds and the community resolves disputes.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            {features.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-border-subtle bg-bg-secondary/50 px-4 py-2.5"
              >
                <p className="text-xs font-semibold text-white">{f.label}</p>
                <p className="text-xs text-text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-text-muted">
          © {new Date().getFullYear()} The Bazaar. Decentralized commerce.
        </p>
      </div>

      {/* Right panel */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-[#142024]">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[300px] w-[300px] rounded-full bg-primary/8 blur-[80px]" />
        </div>

        <div className="relative w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2">
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="6" fill="none"/>
              <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-sm tracking-widest uppercase">The Bazaar</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-text-secondary">Connect your wallet to continue.</p>
          </div>

          {/* MetaMask button */}
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6851b] to-[#e2761b] px-6 py-4 font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
              <div className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <>
                    {/* MetaMask fox SVG */}
                    <svg width="24" height="24" viewBox="0 0 318 318" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M274.1 35.5L174.6 110.6l19.4-45.9 80.1-29.2z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M43.8 35.5l98.6 75.8-18.5-46.6L43.8 35.5z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M238.3 206.8l-26.5 40.6 56.7 15.6 16.3-55.3-46.5-.9z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M33.3 207.7l16.2 55.3 56.7-15.6-26.5-40.6-46.4.9z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M103.6 138.2l-15.8 23.9 56.3 2.5-1.9-60.5-38.6 34.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M214.3 138.2l-39.2-34.8-1.3 61.2 56.2-2.5-15.7-23.9z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M106.2 247.4l33.8-16.5-29.2-22.8-4.6 39.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M178 230.9l33.9 16.5-4.7-39.3-29.2 22.8z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-base">Sign in with MetaMask</span>
                  </>
                )}
              </div>
            </button>

            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-xs text-text-muted">how it works</span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          {/* Steps */}
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/25 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>

          {/* Security note */}
          <p className="text-center text-xs text-text-muted">
            🔒 We never store your private key or seed phrase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
