"use client";
import Script from "next/script";
import Navigation from "./components/navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import ReduxProvider from "./components/redux";
import WalletSubscriber from "./components/wallet-subscriber";
import NetworkBanner from "./components/network-banner";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import Link from "next/link";
import { FiGithub, FiShield, FiZap } from "react-icons/fi";

const inter = Inter({ subsets: ["latin"] });

const FOOTER_LINKS = {
  Marketplace: [
    { href: "/",       label: "Home" },
    { href: "/stores", label: "Browse stores" },
  ],
  Account: [
    { href: "/auth/login",  label: "Sign in" },
    { href: "/orders",      label: "My orders" },
    { href: "/account",     label: "Account settings" },
  ],
  Sellers: [
    { href: "/seller/stores",     label: "Dashboard" },
    { href: "/seller/stores/new", label: "Create a store" },
    { href: "/seller/orders",     label: "Orders received" },
  ],
  Resources: [
    { href: "/about",   label: "About" },
    { href: "/faq",     label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/terms",   label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                <svg width="16" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="35" width="80" height="55" rx="6" stroke="#8b7dff" strokeWidth="7" fill="none"/>
                  <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="#8b7dff" strokeWidth="7" fill="none" strokeLinecap="round"/>
                  <line x1="51" y1="50" x2="51" y2="70" stroke="#8b7dff" strokeWidth="7" strokeLinecap="round"/>
                  <line x1="40" y1="60" x2="62" y2="60" stroke="#8b7dff" strokeWidth="7" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-sm tracking-widest uppercase text-white">The Bazaar</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-[220px]">
              A permissionless marketplace where smart contracts hold funds and the community resolves disputes.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-sunken px-3 py-1 text-xs text-text-muted">
                <FiZap size={11} className="text-primary" /> Built on Ethereum
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-sunken px-3 py-1 text-xs text-text-muted">
                <FiShield size={11} className="text-primary" /> Kleros arbitration
              </span>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div key={title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{title}</p>
              <ul className="space-y-2">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-text-secondary hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} The Bazaar. Decentralized commerce.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="text-xs text-text-muted hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-text-muted hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-xs text-text-muted hover:text-white transition-colors">
              Contact
            </Link>
            <a
              href="https://github.com/TechXTT/The-Bazaar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
            >
              <FiGithub size={13} /> Source on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// FE-8: GA tag id comes from NEXT_PUBLIC_GA_ID. Only load analytics when an id is
// configured and we are not running under e2e (so tests never hit GA).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_ENABLED = Boolean(GA_ID) && process.env.NEXT_PUBLIC_E2E !== "true";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<string>("");
  useEffect(() => { setLocation(window.location.href); }, []);

  return (
    <html lang="en">
      <head>
        {GA_ENABLED && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-background" style={{ background: "radial-gradient(ellipse 120% 60% at 50% -10%, #1a1733 0%, #0d0f17 48%)" }}>
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
            <Footer />
            <Toaster position="bottom-right" richColors theme="dark" />
          </MetaMaskProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
