"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LegacyUserPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/account");
  }, [router]);
  return null;
}
