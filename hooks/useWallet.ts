"use client";

import { CONFIG } from "@/config/config";
import { walletActions } from "@/redux/slices/wallet-slice";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSDK } from "@metamask/sdk-react";
import { useCallback } from "react";
import { useSelector } from "react-redux";

type EthereumProvider = {
  selectedAddress?: string | null;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const normalizeChainId = (chainId?: string | null) => chainId?.toLowerCase();

export const shortAddress = (address?: string | null) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function useWallet() {
  const dispatch = useAppDispatch();
  const { sdk } = useSDK();
  const { account, chainId, status, error } = useSelector((state: RootState) => state.wallet);

  const ethereum = typeof window !== "undefined"
    ? ((window as any).ethereum as EthereumProvider | undefined)
    : undefined;

  const isInstalled = Boolean(ethereum);
  const isCorrectNetwork = normalizeChainId(chainId) === normalizeChainId(CONFIG.CHAIN_ID);
  const connected = status === "connected" && Boolean(account);

  const connect = useCallback(async () => {
    dispatch(walletActions.clearError());
    if (!ethereum) {
      dispatch(walletActions.setError("MetaMask is not installed"));
      return "";
    }

    try {
      dispatch(walletActions.setStatus("connecting"));
      const accounts = await sdk?.connect();
      const selected = (accounts as string[] | undefined)?.[0] || ethereum.selectedAddress || "";
      dispatch(walletActions.setAccount(selected));
      dispatch(walletActions.setStatus(selected ? "connected" : "idle"));
      return selected;
    } catch (err: any) {
      const message = err?.message || "Wallet connection was rejected";
      dispatch(walletActions.setError(message));
      throw err;
    }
  }, [dispatch, ethereum, sdk]);

  const switchNetwork = useCallback(async () => {
    dispatch(walletActions.clearError());
    if (!ethereum) {
      dispatch(walletActions.setError("MetaMask is not installed"));
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CONFIG.CHAIN_ID }],
      });
    } catch (err: any) {
      if (err?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: CONFIG.CHAIN_ID,
              chainName: CONFIG.CHAIN_NAME,
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [CONFIG.RPC_URL],
            },
          ],
        });
        return;
      }

      const message = err?.message || "Network switch was rejected";
      dispatch(walletActions.setError(message));
      throw err;
    }
  }, [dispatch, ethereum]);

  const ensureReady = useCallback(async () => {
    const selected = account || ethereum?.selectedAddress || await connect();
    if (!selected) {
      throw new Error("Connect MetaMask first");
    }
    if (!isCorrectNetwork) {
      await switchNetwork();
    }
    return selected;
  }, [account, connect, ethereum, isCorrectNetwork, switchNetwork]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!ethereum) throw new Error("MetaMask is not installed");
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, account],
    });
    return signature as string;
  }, [ethereum, account]);

  const clearError = useCallback(() => {
    dispatch(walletActions.clearError());
  }, [dispatch]);

  return {
    account,
    chainId,
    connected,
    status,
    displayAccount: shortAddress(account),
    error,
    isCorrectNetwork,
    isInstalled,
    clearError,
    connect,
    ensureReady,
    signMessage,
    switchNetwork,
  };
}
