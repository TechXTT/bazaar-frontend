"use client";

import InfoPage, { InfoSection } from "@/components/ui/info-page";
import Link from "next/link";

const LAST_UPDATED = "May 31, 2026";

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle={`Last updated ${LAST_UPDATED}`}
    >
      <div className="space-y-10">
        <p className="rounded-xl border border-border-subtle bg-bg-secondary p-4 text-sm leading-relaxed text-text-secondary">
          The Bazaar is designed to collect as little about you as possible. There is
          no account sign-up, and we never ask for your name, email, or government ID
          to use the marketplace. This document is a template for a demonstration
          project and is not legal advice.
        </p>

        <InfoSection title="No KYC, no personal accounts">
          <p>
            You authenticate by signing a message with your wallet — not with an
            email and password. We do not run identity verification (KYC) and do not
            maintain a profile of personal information about you.
          </p>
        </InfoSection>

        <InfoSection title="Information processed">
          <p>To operate the marketplace, the following is processed:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-white">Wallet address &amp; on-chain activity:</span>{" "}
              your public address and the orders, escrows, and disputes you create are
              recorded on a public blockchain. This data is inherently public and not
              controlled by us.
            </li>
            <li>
              <span className="text-white">Listing &amp; store content:</span> text and
              images you submit as a seller are stored so they can be displayed.
            </li>
            <li>
              <span className="text-white">Basic technical data:</span> standard logs
              and analytics (e.g. page views) that help keep the service running and
              improve it.
            </li>
          </ul>
        </InfoSection>

        <InfoSection title="The blockchain is public and permanent">
          <p>
            Any transaction you make is written to a public, immutable ledger. It can
            be read by anyone and cannot be deleted or altered by us. Treat your
            wallet address as pseudonymous, not anonymous.
          </p>
        </InfoSection>

        <InfoSection title="Cookies & analytics">
          <p>
            We use minimal cookies/local storage to keep your session and cart, and
            may use privacy-respecting analytics to understand aggregate usage. We do
            not sell your data.
          </p>
        </InfoSection>

        <InfoSection title="Third-party services">
          <p>
            Interacting with the platform involves third parties we do not control —
            your wallet provider, blockchain nodes/RPC providers, and the
            decentralized arbitration protocol. Their handling of data is governed by
            their own policies.
          </p>
        </InfoSection>

        <InfoSection title="Your choices">
          <p>
            You can use a fresh wallet address to limit linkability, disconnect at any
            time, and decline optional analytics via your browser settings. Because
            on-chain data is permanent, deletion of blockchain records is not
            possible.
          </p>
        </InfoSection>

        <InfoSection title="Changes to this policy">
          <p>
            We may update this Privacy Policy periodically. Material changes will be
            reflected by the “last updated” date above.
          </p>
        </InfoSection>

        <p className="text-sm text-text-secondary">
          Questions about privacy?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
          . See also our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </InfoPage>
  );
}
