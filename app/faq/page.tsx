"use client";

import InfoPage from "@/components/ui/info-page";
import { CONFIG } from "@/config/config";
import { formatFeeBps } from "@/utils/helpers";
import Link from "next/link";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const FEE_LABEL = formatFeeBps(CONFIG.PLATFORM_FEE_BPS);

type QA = { q: string; a: string };
type Category = { heading: string; items: QA[] };

const FAQ: Category[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "Do I need an account to use The Bazaar?",
        a: "No. There is no sign-up, email, or password. You connect an Ethereum wallet (e.g. MetaMask) and sign a one-time message to prove ownership. An account is created automatically the first time you sign in — your wallet is your identity.",
      },
      {
        q: "Which wallets and networks are supported?",
        a: "Any EVM wallet that supports message signing works; MetaMask is the primary integration. The app targets the network configured for your deployment — if your wallet is on the wrong chain, a banner will prompt you to switch.",
      },
      {
        q: "Is there a fee to use the marketplace?",
        a: `There are no fees to browse, sign in, open a store, or list products. A flat ${FEE_LABEL} protocol fee is deducted from the seller's payout only when an order is completed — buyers pay the listed price, and refunds are never charged a fee. On-chain transactions also cost gas, like any Ethereum interaction.`,
      },
    ],
  },
  {
    heading: "Buying & escrow",
    items: [
      {
        q: "How does escrow protect me as a buyer?",
        a: "When you pay, your funds are locked in an audited smart contract — not sent directly to the seller. They are released to the seller only after the release window passes or you confirm the order, and you can raise a dispute before then if something goes wrong.",
      },
      {
        q: "Can I pay with a stablecoin instead of ETH?",
        a: "Yes, where the deployment has a configured stablecoin (USDC). At checkout you choose your payment token; the escrow contract handles both native ETH and ERC-20 transfers.",
      },
      {
        q: "What happens after the release window?",
        a: "Once the release time is reached (and no dispute is open), the seller can claim the escrowed funds. You can also release early from the order detail page if you've received your item and want to pay the seller immediately.",
      },
    ],
  },
  {
    heading: "Selling",
    items: [
      {
        q: "How do I start selling?",
        a: "Connect your wallet, open a store from the seller dashboard, and list your products. There's no application or approval step — listing is permissionless.",
      },
      {
        q: "When and how do I get paid?",
        a: `Each paid order is escrowed on-chain. After the release window (or once the buyer releases early), open “Orders received” and claim the funds — individually or in a batch — directly to your wallet. You receive the sale price minus the flat ${FEE_LABEL} protocol fee.`,
      },
    ],
  },
  {
    heading: "Disputes & arbitration",
    items: [
      {
        q: "What if an order goes wrong?",
        a: "Either party can raise a dispute on an active order. Both sides escrow an arbitration fee, submit evidence, and a decentralized arbitrator (Kleros) issues a binding ruling that the contract enforces — releasing or refunding the escrowed funds accordingly.",
      },
      {
        q: "Who resolves disputes?",
        a: "Disputes are decided by Kleros, a decentralized arbitration protocol, rather than by a central authority. Rulings are executed automatically by the escrow contract.",
      },
      {
        q: "What if the other party never funds the arbitration fee?",
        a: "If you fund your share of the arbitration fee and the counterparty fails to fund theirs within the fee window, you can trigger a timeout and win by default.",
      },
    ],
  },
];

function FaqItem({ item }: { item: QA }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="text-sm font-medium text-white">{item.q}</span>
        <FiChevronDown
          size={18}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
            open ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-text-secondary">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Help center"
      title="Frequently asked questions"
      subtitle="Everything you need to know about buying, selling, and staying protected on a decentralized marketplace."
    >
      <div className="space-y-10">
        {FAQ.map((cat) => (
          <div key={cat.heading} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              {cat.heading}
            </h2>
            <div className="space-y-2.5">
              {cat.items.map((item) => (
                <FaqItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border-subtle bg-bg-secondary p-6 text-center">
        <p className="text-sm font-medium text-white">Still have a question?</p>
        <p className="mt-1 text-sm text-text-secondary">
          We&apos;re happy to help — reach out and we&apos;ll get back to you.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-primary transition hover:bg-primary-600"
        >
          Contact us
        </Link>
      </div>
    </InfoPage>
  );
}
