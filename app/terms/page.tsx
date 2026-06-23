import type { Metadata } from "next";
import InfoPage, { InfoSection } from "@/components/ui/info-page";
import Link from "next/link";

// FE-6: read-only page → Server Component with SEO metadata.
export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The Bazaar terms of service.",
};

const LAST_UPDATED = "May 31, 2026";

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      subtitle={`Last updated ${LAST_UPDATED}`}
    >
      <div className="space-y-10">
        <p className="rounded-xl border border-border-subtle bg-bg-secondary p-4 text-sm leading-relaxed text-text-secondary">
          The Bazaar is non-custodial, decentralized software. By accessing or using
          it you agree to these Terms. If you do not agree, do not use the platform.
          This document is a template for a demonstration project and is not legal
          advice.
        </p>

        <InfoSection title="1. The service">
          <p>
            The Bazaar provides an interface to a set of smart contracts deployed on
            a public blockchain that facilitate escrowed trades between independent
            buyers and sellers. We do not take custody of funds, hold inventory, or
            act as a party to any transaction between users.
          </p>
        </InfoSection>

        <InfoSection title="2. Eligibility & accounts">
          <p>
            You access the platform with a self-custodied blockchain wallet. You are
            solely responsible for securing your wallet, private keys, and seed
            phrase. We never have access to them and cannot recover, freeze, or
            reverse access on your behalf. You must be of legal age and permitted to
            use such services in your jurisdiction.
          </p>
        </InfoSection>

        <InfoSection title="3. Buying and selling">
          <p>
            Sellers are solely responsible for their listings, the legality of the
            goods or services offered, and fulfilment. Buyers are responsible for
            evaluating listings before purchasing. We do not verify, endorse, or
            guarantee any listing, user, or transaction.
          </p>
        </InfoSection>

        <InfoSection title="4. Escrow, fees & disputes">
          <p>
            Payments are held by the escrow smart contract and released according to
            its on-chain logic — on confirmation, after the release window, or by an
            arbitrator&apos;s ruling. A protocol fee may be deducted from the
            seller&apos;s payout. Disputes are resolved through decentralized
            arbitration, and the resulting ruling is enforced automatically by the
            contract. Network (gas) fees are charged by the blockchain, not by us.
          </p>
        </InfoSection>

        <InfoSection title="5. Prohibited use">
          <p>
            You agree not to use the platform to trade illegal goods or services, to
            launder funds, to infringe others&apos; rights, or to interfere with the
            integrity or security of the smart contracts or interface. You are
            responsible for complying with all laws and taxes that apply to you.
          </p>
        </InfoSection>

        <InfoSection title="6. No warranty">
          <p>
            The platform and smart contracts are provided “as is” and “as available,”
            without warranties of any kind. Blockchain transactions are irreversible.
            Smart contracts may contain bugs. You use the platform at your own risk.
          </p>
        </InfoSection>

        <InfoSection title="7. Limitation of liability">
          <p>
            To the maximum extent permitted by law, the project, its contributors,
            and maintainers are not liable for any indirect, incidental, or
            consequential damages, or for any loss of funds arising from your use of
            the platform, smart-contract behaviour, or counterparties&apos; conduct.
          </p>
        </InfoSection>

        <InfoSection title="8. Changes to these terms">
          <p>
            We may update these Terms from time to time. Continued use of the
            platform after changes take effect constitutes acceptance of the revised
            Terms.
          </p>
        </InfoSection>

        <p className="text-sm text-text-secondary">
          Questions about these Terms?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
          . See also our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </InfoPage>
  );
}
