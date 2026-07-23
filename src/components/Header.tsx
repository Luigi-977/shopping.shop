"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { count } = useCart();
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display font-bold text-lg tracking-tight flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-signal inline-block" />
          REBOOT<span className="text-wire">/MARKET</span>
        </Link>
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
        </nav>
        <div className="flex items-center gap-3">
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
              <Link href="/login" className="hidden sm:block text-sm hover:text-circuit transition-colors">
                Log in
              </Link>
            )
          )}
          <Link
            href="/cart"
            className="font-display text-sm border border-ink rounded-md px-3 py-1.5 flex items-center gap-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Cart
            <span className="bg-signal text-ink rounded-full min-w-5 h-5 px-1 text-xs flex items-center justify-center font-bold">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
