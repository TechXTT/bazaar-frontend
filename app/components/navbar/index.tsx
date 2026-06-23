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
      className={`relative text-body-strong transition-colors px-1 py-1.5 ${
        active ? "text-vault-text" : "text-vault-text-secondary hover:text-vault-text"
      }`}
    >
      {label}
      {active && (
        <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-vault-accent" />
      )}
    </Link>
  );
}

function UserAvatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div
      className="flex items-center justify-center rounded-vault bg-gradient-to-br from-vault-accent to-vault-violet text-vault-on-accent font-bold"
      style={{
        width: size,
        height: size,
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
          ? "bg-vault-bg/95 backdrop-blur-md border-b border-vault-border shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo — Vault gradient brand mark (Figma navbar node 8:2) */}
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-vault-accent to-vault-violet text-title text-vault-on-accent">
              B
            </span>
            <span className="text-overline uppercase text-vault-text">
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
                  className="relative p-2 rounded-vault-md text-vault-text-secondary hover:text-vault-text hover:bg-vault-surface transition-colors"
                  title="Cart"
                >
                  <FiShoppingCart size={19} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-vault-accent text-[9px] font-bold text-vault-on-accent">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-vault-md hover:bg-vault-surface transition-colors"
                  >
                    {displayName ? (
                      <UserAvatar name={displayName} size={28} />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-vault bg-vault-surface border border-vault-border">
                        <FiUser size={15} className="text-vault-text-tertiary" />
                      </div>
                    )}
                    <span className="hidden sm:block text-body-strong text-vault-text-secondary max-w-[90px] truncate">
                      {auth.user?.FirstName || "Account"}
                    </span>
                    <FiChevronDown
                      size={13}
                      className={`text-vault-text-tertiary transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-vault-lg border border-vault-border bg-vault-surface shadow-vault-popover overflow-hidden z-50">
                      {/* User info header */}
                      {displayName && (
                        <div className="px-4 py-3 border-b border-vault-border">
                          <p className="text-body-strong text-vault-text truncate">{displayName}</p>
                          {walletShort && (
                            <p className="text-caption text-vault-text-tertiary font-mono mt-0.5">{walletShort}</p>
                          )}
                        </div>
                      )}

                      <div className="py-1.5">
                        <DropdownLink href="/account" Icon={FiUser} label="Account" />
                        <DropdownLink href="/orders" Icon={FiPackage} label="My orders" />
                        <DropdownLink href="/seller/stores" Icon={FiShoppingBag} label="Seller dashboard" />
                      </div>

                      <div className="border-t border-vault-border py-1.5">
                        <button
                          onClick={() => { usersService.logout().catch(() => {}); dispatch(logout()); window.location.href = "/"; }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-body text-vault-danger hover:bg-vault-surface-2 transition-colors"
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
                className="bg-vault-accent text-vault-on-accent text-body-strong font-semibold px-4 py-2 rounded-vault-md hover:opacity-90 transition-opacity shadow-vault-glow"
              >
                Sign in
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-vault-md text-vault-text-secondary hover:text-vault-text hover:bg-vault-surface transition-colors ml-1"
            >
              {mobileOpen ? <FiX size={19} /> : <FiMenu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-vault-bg/98 backdrop-blur-md border-t border-vault-border">
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((l) => (
              <MobileLink key={l.href} href={l.href}>{l.label}</MobileLink>
            ))}
            {auth.isLoggedIn ? (
              <>
                <MobileLink href="/seller/stores">Seller dashboard</MobileLink>
                <div className="my-2 border-t border-vault-border" />
                <MobileLink href="/cart">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                </MobileLink>
                <MobileLink href="/account">Account</MobileLink>
                <MobileLink href="/orders">My orders</MobileLink>
                <div className="my-2 border-t border-vault-border" />
                <button
                  onClick={() => { usersService.logout().catch(() => {}); dispatch(logout()); window.location.href = "/"; }}
                  className="block w-full text-left px-3 py-2.5 text-body-strong text-vault-danger hover:bg-vault-surface-2 rounded-vault-md transition-colors"
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
      className="flex items-center gap-2.5 px-4 py-2 text-body text-vault-text-secondary hover:text-vault-text hover:bg-vault-surface-2 transition-colors"
    >
      <Icon size={14} className="text-vault-text-tertiary" />
      {label}
    </Link>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2.5 text-body-strong text-vault-text-secondary hover:text-vault-text rounded-vault-md hover:bg-vault-surface-2 transition-colors"
    >
      {children}
    </Link>
  );
}
