"use client";

import { RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import SellerSidebar from "@/components/ui/seller-sidebar";

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
        <div className="grid gap-6 lg:grid-cols-[256px_1fr]">
          <SellerSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
