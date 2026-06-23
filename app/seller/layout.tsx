"use client";

import { RootState } from "@/redux/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { FiAlertCircle, FiPackage, FiShoppingBag } from "react-icons/fi";

const NAV = [
  { href: "/seller/stores",   label: "Stores",          Icon: FiShoppingBag  },
  { href: "/seller/orders",   label: "Orders received", Icon: FiPackage      },
  { href: "/seller/disputes", label: "Disputes",        Icon: FiAlertCircle  },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const auth = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  // FE-11: wait for rehydration/bootstrap before deciding to redirect, so a refresh
  // doesn't bounce a genuinely logged-in seller to /auth/login.
  useEffect(() => {
    if (auth.bootstrapped && !auth.isLoggedIn) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [auth.bootstrapped, auth.isLoggedIn, pathname, router]);

  if (!auth.bootstrapped) return null;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-border-subtle bg-bg-secondary p-3 space-y-1 lg:sticky lg:top-24">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Seller
            </p>
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-sunken hover:text-white"
                  }`}
                >
                  <Icon size={15} className={active ? "text-primary" : "text-text-muted"} />
                  {label}
                </Link>
              );
            })}
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
