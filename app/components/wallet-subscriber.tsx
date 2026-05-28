"use client";

import { walletActions } from "@/redux/slices/wallet-slice";
import { useAppDispatch } from "@/redux/store";
import { useSDK } from "@metamask/sdk-react";
import { useEffect } from "react";

type EthereumProvider = {
  selectedAddress?: string | null;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
};

export default function WalletSubscriber() {
  const dispatch = useAppDispatch();
  const { connected, chainId } = useSDK();

  useEffect(() => {
    dispatch(walletActions.setChainId(chainId || null));
  }, [chainId, dispatch]);

  useEffect(() => {
    if (!connected) {
      dispatch(walletActions.disconnect());
      return;
    }

    dispatch(walletActions.setStatus("connected"));
  }, [connected, dispatch]);

  useEffect(() => {
    const ethereum =
      typeof window !== "undefined"
        ? ((window as any).ethereum as EthereumProvider | undefined)
        : undefined;
    if (!ethereum) return;

    if (ethereum.selectedAddress) {
      dispatch(walletActions.setAccount(ethereum.selectedAddress));
      dispatch(walletActions.setStatus("connected"));
    }

    const handleAccountsChanged = (accounts: string[]) => {
      const next = accounts?.[0] || "";
      if (!next) {
        dispatch(walletActions.disconnect());
        return;
      }

      dispatch(walletActions.setAccount(next));
      dispatch(walletActions.setStatus("connected"));
    };

    const handleChainChanged = (nextChainId: string) => {
      dispatch(walletActions.setChainId(nextChainId));
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [dispatch]);

  return null;
}
