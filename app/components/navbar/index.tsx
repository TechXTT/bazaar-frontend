"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/redux/store";
import { clearCart, logout, setUser } from "@/redux/slices/auth-slice";
import { usersService } from "@/api";
import { useSDK } from "@metamask/sdk-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown } from "react-icons/fi";

const NavLink = ({ href, children }: { href: string; children: string }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
        active ? "text-white" : "text-text-secondary hover:text-white hover:bg-bg-secondary"
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navigation() {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const { chainId } = useSDK();
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

  useEffect(() => {
    if (chainId && chainId !== "0xaa36a7" && window.ethereum) {
      window.ethereum
        .request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] })
        .catch(() => {});
    }
  }, [chainId]);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#182628]/90 backdrop-blur-md border-b border-border-subtle shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="35" width="80" height="55" rx="6" stroke="white" strokeWidth="5" fill="none"/>
              <path d="M34 35V28C34 18.6 41.6 11 51 11C60.4 11 68 18.6 68 28V35" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round"/>
              <line x1="51" y1="50" x2="51" y2="70" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <line x1="40" y1="60" x2="62" y2="60" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-base tracking-widest uppercase">The Bazaar</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/stores">Stores</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {auth.isLoggedIn ? (
              <>
                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative p-2 rounded-lg text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors"
                  title="Cart"
                >
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 p-2 rounded-lg text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors"
                  >
                    <FiUser size={20} />
                    <FiChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border-subtle bg-[#1a2e32] shadow-xl py-1 z-50">
                      <DropdownItem href="/account">Account</DropdownItem>
                      <DropdownItem href="/orders">My orders</DropdownItem>
                      <DropdownItem href="/seller/stores">Seller dashboard</DropdownItem>
                      <div className="my-1 border-t border-border-subtle" />
                      <button
                        onClick={() => { dispatch(logout()); window.location.href = "/"; }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-bg-secondary transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign in
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-bg-secondary transition-colors"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#182628] border-t border-border-subtle px-4 py-3 space-y-1">
          <MobileLink href="/">Home</MobileLink>
          <MobileLink href="/stores">Stores</MobileLink>
          {auth.isLoggedIn ? (
            <>
              <MobileLink href="/cart">{`Cart${cartCount > 0 ? ` (${cartCount})` : ""}`}</MobileLink>
              <MobileLink href="/account">Account</MobileLink>
              <MobileLink href="/orders">My orders</MobileLink>
              <MobileLink href="/seller/stores">Seller dashboard</MobileLink>
              <button
                onClick={() => { dispatch(logout()); window.location.href = "/"; }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <MobileLink href="/auth/login">Sign in</MobileLink>
          )}
        </div>
      )}
    </header>
  );
}

const DropdownItem = ({ href, children }: { href: string; children: string }) => (
  <Link href={href} className="block px-4 py-2 text-sm hover:bg-bg-secondary transition-colors">
    {children}
  </Link>
);

const MobileLink = ({ href, children }: { href: string; children: string }) => (
  <Link href={href} className="block px-3 py-2 text-sm font-medium text-text-secondary hover:text-white rounded-lg hover:bg-bg-secondary transition-colors">
    {children}
  </Link>
);
