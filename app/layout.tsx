"use client";
import Script from "next/script";
import Navigation from "./components/navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import ReduxProvider from "./components/redux";
import { MetaMaskProvider } from '@metamask/sdk-react';

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "The Bazaar",
//   description: "The Bazaar is a decentralized marketplace for buying and selling goods.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <head>
				<Script src="https://www.googletagmanager.com/gtag/js?id=G-1H1H1CR559" strategy="afterInteractive" />
				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());

						gtag('config', 'G-1H1H1CR559');
					`}
				</Script>
			</head>
      <body className="bg-[#182628]">
      <ReduxProvider>
        <MetaMaskProvider debug={true} sdkOptions={{
          dappMetadata: {
            name: 'The Bazaar',
            url: window.location.href,
          }
        }}>
            <Navigation />
            <div>
            {children}
            </div>
            </MetaMaskProvider>
      </ReduxProvider>
      </body>
    </html>
  );
}