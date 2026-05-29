"use client";

import Link from "next/link";
import { FiGithub, FiShield, FiZap } from "react-icons/fi";

const LINKS = {
  Marketplace: [
    { href: "/",       label: "Home" },
    { href: "/stores", label: "Browse stores" },
  ],
  Account: [
    { href: "/auth/login",    label: "Sign in" },
    { href: "/orders",        label: "My orders" },
    { href: "/account",       label: "Account settings" },
  ],
  Sellers: [
    { href: "/seller/stores",     label: "Dashboard" },
    { href: "/seller/stores/new", label: "Create a store" },
    { href: "/seller/orders",     label: "Orders received" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                <svg width="16" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="35" width="80" height="55" rx="6" stroke="#6366f1" strokeWidth="7" fill="none"/>
                  <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="#6366f1" strokeWidth="7" fill="none" strokeLinecap="round"/>
                  <line x1="51" y1="50" x2="51" y2="70" stroke="#6366f1" strokeWidth="7" strokeLinecap="round"/>
                  <line x1="40" y1="60" x2="62" y2="60" stroke="#6366f1" strokeWidth="7" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-sm tracking-widest uppercase text-white">
                The Bazaar
              </span>
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

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {title}
              </p>
              <ul className="space-y-2">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-text-secondary hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} The Bazaar. Decentralized commerce.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
          >
            <FiGithub size={13} /> Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
