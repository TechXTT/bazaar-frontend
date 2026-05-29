"use client";

import Card from "@/components/ui/card";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const items = [
  { href: "/seller/stores", label: "Stores" },
  { href: "/seller/orders", label: "Orders received" },
  { href: "/seller/disputes", label: "Disputes" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const auth = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.replace(`/auth/login?next=${pathname}`);
    }
  }, [auth.isLoggedIn, pathname, router]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <Card className="h-fit p-3">
            <nav className="grid gap-2 lg:block">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm font-medium ${
                      active ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-bg-secondary hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </Card>
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
