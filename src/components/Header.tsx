"use client";

import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import CurrencyPicker from "./CurrencyPicker";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const { count } = useCart();
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <MobileMenu />
          <Link href="/" className="font-display font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-signal inline-block shrink-0" />
            <span className="truncate">
              REBOOT<span className="text-wire hidden sm:inline">/MARKET</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/shop" className="hover:text-circuit transition-colors">
            Shop
          </Link>
          <Link href="/sell" className="hover:text-circuit transition-colors">
            Sell yours
          </Link>
          <Link href="/shop#grading" className="hover:text-circuit transition-colors">
            Grading guide
          </Link>
          <Link href="/how-it-works" className="hover:text-circuit transition-colors">
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <CurrencyPicker />
          {!loading && (
            user ? (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                {user.role === "admin" && (
                  <Link href="/admin" className="hover:text-circuit transition-colors">
                    Till
                  </Link>
                )}
                <Link href="/account" className="hover:text-circuit transition-colors">
                  {user.name || user.email.split("@")[0]}
                </Link>
                <button onClick={logout} className="text-wire hover:text-rust">
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Log in"
                className="font-display text-sm border border-ink rounded-md hover:bg-ink hover:text-paper transition-colors w-9 h-9 flex items-center justify-center sm:w-auto sm:h-auto sm:px-3 sm:py-1.5"
              >
                <User size={16} className="sm:hidden" />
                <span className="hidden sm:inline">Log in</span>
              </Link>
            )
          )}
          {!loading && user && (
            <Link href="/account" className="sm:hidden w-9 h-9 flex items-center justify-center border border-ink rounded-md">
              <User size={16} />
            </Link>
          )}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative font-display text-sm border border-ink rounded-md hover:bg-ink hover:text-paper transition-colors w-9 h-9 flex items-center justify-center sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 sm:gap-2"
          >
            <ShoppingCart size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Cart</span>
            <span className="absolute -top-1.5 -right-1.5 sm:static bg-flash text-white rounded-full min-w-5 h-5 px-1 text-[10px] sm:text-xs flex items-center justify-center font-bold">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
