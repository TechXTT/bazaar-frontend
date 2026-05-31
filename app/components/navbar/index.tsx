"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { logout, setUser } from "@/redux/slices/auth-slice";
import { usersService } from "@/api";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiPackage,
  FiShoppingBag,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/stores", label: "Stores" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`relative text-sm font-medium transition-colors px-1 py-1.5 ${
        active ? "text-white" : "text-text-secondary hover:text-white"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function UserAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="flex items-center justify-center rounded-lg text-white font-bold text-xs"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue},55%,42%)`,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}

export default function Navigation() {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Network mismatches are surfaced (with a switch button) by <NetworkBanner />,
  // which is driven by CONFIG.CHAIN_ID. We intentionally do not auto-switch here.

  useEffect(() => {
    if (!auth.isLoggedIn || !auth.jwt) { dispatch(logout()); return; }
    usersService.getMe()
      .then((res) => { if (res.status === 200) dispatch(setUser(res.data)); else dispatch(logout()); })
      .catch(() => dispatch(logout()));
  }, [auth.jwt]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cartCount = auth.cart?.products?.length ?? 0;
  const displayName = auth.user
    ? `${auth.user.FirstName} ${auth.user.LastName}`.trim()
    : "";
  const walletShort = auth.user?.WalletAddress
    ? `${auth.user.WalletAddress.slice(0, 6)}…${auth.user.WalletAddress.slice(-4)}`
    : "";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0f1e20]/95 backdrop-blur-md border-b border-border-subtle shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
              <svg width="16" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="35" width="80" height="55" rx="6" stroke="currentColor" strokeWidth="7" fill="none" className="text-primary" style={{color: "var(--color-primary, #6366f1)"}} />
                <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="currentColor" strokeWidth="7" fill="none" strokeLinecap="round" style={{color: "var(--color-primary, #6366f1)"}} />
                <line x1="51" y1="50" x2="51" y2="70" stroke="currentColor" strokeWidth="7" strokeLinecap="round" style={{color: "var(--color-primary, #6366f1)"}} />
                <line x1="40" y1="60" x2="62" y2="60" stroke="currentColor" strokeWidth="7" strokeLinecap="round" style={{color: "var(--color-primary, #6366f1)"}} />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-white">
              The Bazaar
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
            {auth.isLoggedIn && (
              <NavLink href="/seller/stores" label="Seller" />
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {auth.isLoggedIn ? (
              <>
                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors"
                  title="Cart"
                >
                  <FiShoppingCart size={19} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-bg-secondary transition-colors"
                  >
                    {displayName ? (
                      <UserAvatar name={displayName} size={28} />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-secondary border border-border-subtle">
                        <FiUser size={15} className="text-text-muted" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-text-secondary max-w-[90px] truncate">
                      {auth.user?.FirstName || "Account"}
                    </span>
                    <FiChevronDown
                      size={13}
                      className={`text-text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border-subtle bg-[#141f22] shadow-2xl overflow-hidden z-50">
                      {/* User info header */}
                      {displayName && (
                        <div className="px-4 py-3 border-b border-border-subtle">
                          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                          {walletShort && (
                            <p className="text-xs text-text-muted font-mono mt-0.5">{walletShort}</p>
                          )}
                        </div>
                      )}

                      <div className="py-1.5">
                        <DropdownLink href="/account" Icon={FiUser} label="Account" />
                        <DropdownLink href="/orders" Icon={FiPackage} label="My orders" />
                        <DropdownLink href="/seller/stores" Icon={FiShoppingBag} label="Seller dashboard" />
                      </div>

                      <div className="border-t border-border-subtle py-1.5">
                        <button
                          onClick={() => { dispatch(logout()); window.location.href = "/"; }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-bg-secondary transition-colors"
                        >
                          <FiLogOut size={14} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Sign in
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors ml-1"
            >
              {mobileOpen ? <FiX size={19} /> : <FiMenu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f1e20]/98 backdrop-blur-md border-t border-border-subtle">
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((l) => (
              <MobileLink key={l.href} href={l.href}>{l.label}</MobileLink>
            ))}
            {auth.isLoggedIn ? (
              <>
                <MobileLink href="/seller/stores">Seller dashboard</MobileLink>
                <div className="my-2 border-t border-border-subtle" />
                <MobileLink href="/cart">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                </MobileLink>
                <MobileLink href="/account">Account</MobileLink>
                <MobileLink href="/orders">My orders</MobileLink>
                <div className="my-2 border-t border-border-subtle" />
                <button
                  onClick={() => { dispatch(logout()); window.location.href = "/"; }}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-bg-secondary rounded-xl transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <MobileLink href="/auth/login">Sign in</MobileLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownLink({ href, Icon, label }: { href: string; Icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors"
    >
      <Icon size={14} className="text-text-muted" />
      {label}
    </Link>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-white rounded-xl hover:bg-bg-secondary transition-colors"
    >
      {children}
    </Link>
  );
}
