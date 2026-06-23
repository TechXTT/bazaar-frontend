"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FiAlertCircle, FiPackage, FiShoppingBag } from "react-icons/fi";
import { useWallet } from "@/hooks/useWallet";

/**
 * Vault SellerSidebar (Figma node 25:2): "Seller Studio" rail with the brand mark,
 * an overline, active/idle nav rows, and a connected-wallet chip pinned to the
 * bottom. Active row is the accent-soft pill with the accent border.
 */
const NAV = [
  { href: "/seller/stores", label: "Stores", Icon: FiShoppingBag },
  { href: "/seller/orders", label: "Orders received", Icon: FiPackage },
  { href: "/seller/disputes", label: "Disputes", Icon: FiAlertCircle },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const { displayAccount } = useWallet();

  return (
    <aside className="flex h-fit flex-col gap-1.5 rounded-vault-lg border border-vault-border bg-vault-surface p-4 lg:sticky lg:top-24">
      <div className="flex items-center gap-2.5 px-2 pb-3 pt-1">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-vault-accent to-vault-violet text-title text-vault-on-accent">
          B
        </span>
        <span className="text-overline uppercase text-vault-text">The Bazaar</span>
      </div>
      <p className="px-2 pb-1 text-overline uppercase text-vault-text-tertiary">Seller Studio</p>

      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 rounded-vault-md border px-3 py-2.5 text-body-strong transition-all",
              active
                ? "border-vault-border-accent bg-vault-accent-soft text-vault-accent"
                : "border-transparent text-vault-text-secondary hover:bg-vault-surface-2 hover:text-vault-text"
            )}
          >
            <span
              className={clsx(
                "flex h-[18px] w-[18px] items-center justify-center rounded-[6px]",
                active ? "bg-vault-accent text-vault-on-accent" : "bg-vault-surface-3 text-vault-text-tertiary"
              )}
            >
              <Icon size={11} />
            </span>
            {label}
          </Link>
        );
      })}

      {displayAccount && (
        <div className="mt-4 flex items-center gap-2.5 rounded-vault-md border border-vault-border bg-vault-surface-2 px-3 py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-vault-success" />
          <span className="truncate font-mono text-label text-vault-text-secondary">
            {displayAccount}
          </span>
        </div>
      )}
    </aside>
  );
}
