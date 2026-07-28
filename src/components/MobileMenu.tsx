"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Smartphone,
  Laptop,
  Tv,
  Speaker,
  Refrigerator,
  Tablet,
  Camera,
  Gamepad2,
  Monitor,
  LayoutGrid,
  Tag,
  BadgeCheck,
  HelpCircle,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const CATEGORY_ICONS: Record<string, typeof Smartphone> = {
  Phones: Smartphone,
  Laptops: Laptop,
  TVs: Tv,
  "Sound Systems": Speaker,
  Fridges: Refrigerator,
  Tablets: Tablet,
  Cameras: Camera,
  Gaming: Gamepad2,
  Monitors: Monitor,
};

const CATEGORIES = [
  "Phones",
  "Laptops",
  "TVs",
  "Sound Systems",
  "Fridges",
  "Tablets",
  "Cameras",
  "Gaming",
  "Monitors",
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard SSR-safe portal mount flag; document.body only exists client-side
    setMounted(true);
  }, []);

  function close() {
    setOpen(false);
  }

  const drawer = (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-ink/50" onClick={close} />
          <div className="absolute inset-y-0 left-0 w-[82vw] max-w-xs bg-paper shadow-2xl flex flex-col overflow-y-auto">
            <div className="bg-ink text-paper px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-bold text-lg">
                  REBOOT<span className="text-paper/50">/MARKET</span>
                </p>
                <button onClick={close} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              {user ? (
                <Link
                  href="/account"
                  onClick={close}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <User size={16} />
                  {user.name || user.email.split("@")[0]}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={close}
                  className="inline-block bg-flash text-white text-sm font-display font-bold px-4 py-2 rounded-md"
                >
                  Log in / Register
                </Link>
              )}
            </div>

            <Link
              href="/shop"
              onClick={close}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-ink/10 font-medium"
            >
              <Home size={18} className="text-circuit" />
              Shop home
            </Link>

            <p className="px-5 pt-4 pb-2 text-xs font-display uppercase tracking-wide text-wire">
              Categories
            </p>
            <Link
              href="/shop"
              onClick={close}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink/[0.03]"
            >
              <LayoutGrid size={17} className="text-flash" />
              All categories
            </Link>
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c] ?? LayoutGrid;
              return (
                <Link
                  key={c}
                  href={`/shop?category=${encodeURIComponent(c)}`}
                  onClick={close}
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink/[0.03]"
                >
                  <Icon size={17} className="text-wire" />
                  {c}
                </Link>
              );
            })}

            <p className="px-5 pt-4 pb-2 text-xs font-display uppercase tracking-wide text-wire border-t border-ink/10">
              More
            </p>
            <Link
              href="/sell"
              onClick={close}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink/[0.03]"
            >
              <Tag size={17} className="text-wire" />
              Sell your device
            </Link>
            <Link
              href="/shop#grading"
              onClick={close}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink/[0.03]"
            >
              <BadgeCheck size={17} className="text-wire" />
              Grading guide
            </Link>
            <Link
              href="/how-it-works"
              onClick={close}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink/[0.03]"
            >
              <HelpCircle size={17} className="text-wire" />
              How it works
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={close}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-ink/[0.03]"
              >
                <ShieldCheck size={17} className="text-wire" />
                Till (admin)
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  logout();
                  close();
                }}
                className="flex items-center gap-3 px-5 py-3 text-left text-rust border-t border-ink/10 mt-2"
              >
                Log out
              </button>
            )}
          </div>
        </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden w-9 h-9 flex items-center justify-center -ml-1.5"
      >
        <Menu size={22} />
      </button>

      {open && mounted && createPortal(drawer, document.body)}
    </>
  );
}
