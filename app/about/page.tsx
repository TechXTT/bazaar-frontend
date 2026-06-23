import type { Metadata } from "next";
import InfoPage from "@/components/ui/info-page";
import Link from "next/link";
import { FiArrowRight, FiGlobe, FiLock, FiShield, FiUsers } from "react-icons/fi";

// FE-6: read-only marketing page → Server Component with SEO metadata.
export const metadata: Metadata = {
  title: "About",
  description:
    "The Bazaar is a permissionless, escrow-protected marketplace with community dispute resolution.",
};

const VALUES = [
  {
    Icon: FiLock,
    title: "Non-custodial by design",
    desc: "Funds live in audited smart contracts, never in a company bank account. No one can freeze or seize your balance.",
  },
  {
    Icon: FiShield,
    title: "Protected every trade",
    desc: "On-chain escrow holds payment until delivery is confirmed, so neither side has to trust the other to act in good faith.",
  },
  {
    Icon: FiUsers,
    title: "Community arbitration",
    desc: "Disputes are settled by decentralized arbitrators, not a support queue with the final say behind closed doors.",
  },
  {
    Icon: FiGlobe,
    title: "Permissionless & open",
    desc: "Anyone with a wallet can buy or sell — no KYC, no approvals, no gatekeepers. The code is open source.",
  },
];

const STEPS = [
  { n: "01", title: "Connect", desc: "Sign in with your wallet — no email, no password." },
  { n: "02", title: "Pay into escrow", desc: "Your funds lock in a smart contract instead of going straight to the seller." },
  { n: "03", title: "Confirm or dispute", desc: "Release funds when you're satisfied, or open a dispute if something's wrong." },
  { n: "04", title: "Settled on-chain", desc: "The contract pays out the seller, or an arbitrator's ruling decides the outcome." },
];

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Commerce without middlemen"
      subtitle="The Bazaar is a permissionless marketplace where smart contracts hold the funds and the community resolves disputes — trade with anyone, trust no one."
      width="wide"
    >
      {/* Mission */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-sm leading-relaxed text-vault-text-secondary sm:text-base">
          Traditional marketplaces ask you to trust a company with your money, your
          data, and the final word on every dispute. We think you shouldn&apos;t have
          to. The Bazaar replaces that trust with code: payments are escrowed
          on-chain, identity is your wallet, and disagreements are settled by
          decentralized arbitration rather than a hidden support desk.
        </p>
      </div>

      {/* Values */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-vault-border bg-vault-surface p-6 transition-colors hover:border-vault-accent/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-vault-accent/20 bg-vault-accent/10 text-vault-accent">
              <v.Icon size={20} />
            </div>
            <h3 className="mt-4 font-semibold text-white">{v.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-vault-text-secondary">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-16 space-y-6">
        <h2 className="text-center text-2xl font-bold text-white">How a trade works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="relative overflow-hidden rounded-2xl border border-vault-border bg-vault-surface p-6"
            >
              <span className="pointer-events-none absolute -top-3 right-1 select-none text-6xl font-black leading-none text-vault-border/50">
                {s.n}
              </span>
              <h3 className="relative font-semibold text-white">{s.title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-vault-text-secondary">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-vault-accent to-vault-violet p-10 text-center sm:p-14">
        <h2 className="text-2xl font-bold text-white">Ready to trade trustlessly?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/75">
          Browse stores or open your own in minutes — no application, no approval, no listing fees.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-vault-accent shadow-xl transition hover:bg-white/90"
          >
            Browse stores <FiArrowRight size={16} />
          </Link>
          <Link
            href="/seller/stores"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open a store
          </Link>
        </div>
      </div>
    </InfoPage>
  );
}
