"use client";

import { MetaMaskProvider } from "@metamask/sdk-react";
import { useEffect, useState } from "react";
import WalletSubscriber from "./components/wallet-subscriber";
import ReduxProvider from "./components/redux";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState("");

  useEffect(() => {
    setLocation(window.location.href);
  }, []);

  return (
    <ReduxProvider>
      <MetaMaskProvider
        debug={true}
        sdkOptions={{
          dappMetadata: {
            name: "The Bazaar",
            url: location,
          },
        }}
      >
        <WalletSubscriber />
        {children}
      </MetaMaskProvider>
    </ReduxProvider>
  );
}
