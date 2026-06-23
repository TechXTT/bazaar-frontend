"use client";

import { useEffect, useState } from "react";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { Toaster } from "sonner";
import ReduxProvider from "./components/redux";
import Navigation from "./components/navbar";
import WalletSubscriber from "./components/wallet-subscriber";
import NetworkBanner from "./components/network-banner";

/**
 * FE-6: all client-only runtime (Redux/persist, MetaMask SDK, navbar, network
 * banner, toasts) lives here so app/layout.tsx can be a Server Component that
 * exports `metadata`. Everything that was previously forcing the whole layout to
 * be "use client" is isolated in this single client boundary.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<string>("");
  useEffect(() => {
    setLocation(window.location.href);
  }, []);

  return (
    <ReduxProvider>
      <MetaMaskProvider
        debug={true}
        sdkOptions={{
          dappMetadata: { name: "The Bazaar", url: location },
          // Under e2e tests an injected window.ethereum shim is provided; force the
          // SDK to adopt it instead of starting a remote (QR/socket) connection that
          // can't complete headlessly. No effect in normal use.
          ...(process.env.NEXT_PUBLIC_E2E === "true"
            ? { extensionOnly: true, checkInstallationImmediately: false }
            : {}),
        }}
      >
        <WalletSubscriber />
        <Navigation />
        <NetworkBanner />
        <div className="pt-16">{children}</div>
        <Toaster position="bottom-right" richColors theme="dark" />
      </MetaMaskProvider>
    </ReduxProvider>
  );
}
