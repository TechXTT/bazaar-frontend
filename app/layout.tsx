import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Footer from "@/components/ui/footer";

const inter = Inter({ subsets: ["latin"] });

// FE-6: real SEO metadata, now that the root layout is a Server Component.
export const metadata: Metadata = {
  title: {
    default: "The Bazaar — Decentralized escrow marketplace",
    template: "%s · The Bazaar",
  },
  description:
    "A permissionless marketplace where smart contracts hold funds in escrow and the community resolves disputes via Kleros arbitration.",
  metadataBase: process.env.NEXT_PUBLIC_CURRENT_URL
    ? new URL(process.env.NEXT_PUBLIC_CURRENT_URL)
    : undefined,
  openGraph: {
    title: "The Bazaar — Decentralized escrow marketplace",
    description:
      "Buy and sell with on-chain escrow protection and community dispute resolution.",
    type: "website",
  },
};

// FE-8: GA tag id comes from NEXT_PUBLIC_GA_ID. Only load analytics when an id is
// configured and we are not running under e2e (so tests never hit GA).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_ENABLED = Boolean(GA_ID) && process.env.NEXT_PUBLIC_E2E !== "true";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
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
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
