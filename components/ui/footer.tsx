import Link from "next/link";
import { FiGithub, FiShield, FiZap } from "react-icons/fi";

/**
 * Vault Footer (Figma node 9:2): brand column with trust chips + four link columns,
 * a divider, and a bottom legal/social row. Surface-2 background on a top border.
 */
const FOOTER_LINKS: Record<string, { href: string; label: string }[]> = {
  Marketplace: [
    { href: "/", label: "Home" },
    { href: "/stores", label: "Browse stores" },
  ],
  Account: [
    { href: "/auth/login", label: "Sign in" },
    { href: "/orders", label: "My orders" },
    { href: "/account", label: "Account settings" },
  ],
  Sellers: [
    { href: "/seller/stores", label: "Dashboard" },
    { href: "/seller/stores/new", label: "Create a store" },
    { href: "/seller/orders", label: "Orders received" },
  ],
  Resources: [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-vault-border bg-vault-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-vault-accent to-vault-violet text-title text-vault-on-accent">
                B
              </span>
              <span className="text-overline uppercase text-vault-text">The Bazaar</span>
            </Link>
            <p className="max-w-[220px] text-body leading-relaxed text-vault-text-secondary">
              A permissionless marketplace where smart contracts hold funds and the community
              resolves disputes.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-vault-full border border-vault-border bg-vault-inset px-3 py-1 text-caption text-vault-text-tertiary">
                <FiZap size={11} className="text-vault-accent" /> Built on Ethereum
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-vault-full border border-vault-border bg-vault-inset px-3 py-1 text-caption text-vault-text-tertiary">
                <FiShield size={11} className="text-vault-accent" /> Kleros arbitration
              </span>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div key={title} className="space-y-3">
              <p className="text-overline uppercase text-vault-text-tertiary">{title}</p>
              <ul className="space-y-2">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-body text-vault-text-secondary transition-colors hover:text-vault-text"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-vault-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-vault-text-tertiary">
            © {new Date().getFullYear()} The Bazaar. Decentralized commerce.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="text-caption text-vault-text-tertiary transition-colors hover:text-vault-text">
              Terms
            </Link>
            <Link href="/privacy" className="text-caption text-vault-text-tertiary transition-colors hover:text-vault-text">
              Privacy
            </Link>
            <Link href="/contact" className="text-caption text-vault-text-tertiary transition-colors hover:text-vault-text">
              Contact
            </Link>
            <a
              href="https://github.com/TechXTT/The-Bazaar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-caption text-vault-text-tertiary transition-colors hover:text-vault-text"
            >
              <FiGithub size={13} /> Source on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
