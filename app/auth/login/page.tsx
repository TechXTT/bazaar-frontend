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

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // 1. Connect wallet
      const accounts = await sdk?.connect();
      const walletAddress = (accounts as string[])?.[0];
      if (!walletAddress) throw new Error("No wallet address");

      // 2. Get nonce
      const nonceRes = await usersService.getNonce(walletAddress);
      const { nonce } = nonceRes.data;

      // 3. Build + sign SIWE message
      const checksumAddress = getAddress(walletAddress);
      const message = buildSiweMessage(checksumAddress, nonce);
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      // 4. Verify with backend
      const verifyRes = await usersService.verifySIWE(message, signature as string);
      const { token, user } = verifyRes.data;

      // 5. Store in Redux
      dispatch(login(token));
      dispatch(setUser(user));
      router.push("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data ??
        err?.message ??
        "Sign-in failed";
      toast.error(typeof msg === "string" ? msg : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 mx-auto h-screen">
      <div className="w-full max-w-sm bg-bg-secondary rounded-xl shadow p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-text-secondary">
            Connect your MetaMask wallet to continue.
          </p>
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign in with MetaMask"}
        </button>

        <p className="text-xs text-center text-text-secondary">
          No account? One will be created automatically on first sign-in.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
