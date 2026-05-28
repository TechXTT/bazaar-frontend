"use client";

import { CONFIG } from "@/config/config";
import { useWallet } from "@/hooks/useWallet";
import Button from "@/components/ui/button";

export default function NetworkBanner() {
  const wallet = useWallet();

  if (!wallet.connected || wallet.isCorrectNetwork) {
    return null;
  }

  return (
    <div className="sticky top-20 z-40 border-b border-status-warning/30 bg-status-warning/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-sm text-status-warning sm:px-6 lg:px-8">
        <p>MetaMask is connected to the wrong network. Switch to {CONFIG.CHAIN_NAME}.</p>
        <Button size="sm" variant="secondary" onClick={wallet.switchNetwork}>
          Switch network
        </Button>
      </div>
    </div>
  );
}
