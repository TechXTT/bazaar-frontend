"use client";

import { logout } from "@/redux/slices/auth-slice";
import { useAppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(logout());
    router.replace("/");
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-text-secondary">Signing out…</p>
    </div>
  );
}
