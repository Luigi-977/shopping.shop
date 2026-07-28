"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import type { Product } from "@prisma/client";

type CartLine = { product: Product; qty: number };

type CheckoutResult =
  | { ok: true; mode: "demo"; orderId: string }
  | { ok: true; mode: "live"; link: string; orderId: string }
  | { ok: false; error: string };

type CartContextType = {
  lines: CartLine[];
  add: (product: Product) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  checkout: (email: string, currency: string) => Promise<CheckoutResult>;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "reboot-market-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const refreshedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // The cart stores a snapshot of each product at the moment it was added.
  // That snapshot can go stale (a photo gets uploaded later, a price
  // changes, it goes out of stock) and localStorage keeps it around
  // indefinitely. So every time the cart provider mounts — every page
  // load, for as long as this browser tab/session is open — refresh each
  // line against the live product record.
  useEffect(() => {
    if (!hydrated || refreshedRef.current) return;
    refreshedRef.current = true;
    if (lines.length === 0) return;
    (async () => {
      const results = await Promise.all(
        lines.map(async (l) => {
          try {
            const res = await fetch(`/api/products/${encodeURIComponent(l.product.slug)}`);
            if (!res.ok) return l;
            const data = await res.json();
            if (!data.product) return l;
            return { product: data.product as Product, qty: l.qty };
          } catch {
            return l;
          }
        })
      );
      setLines(results);
    })();
  }, [hydrated, lines]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  function add(product: Product) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.slug === product.slug);
      if (existing) {
        return prev.map((l) =>
          l.product.slug === product.slug ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function remove(slug: string) {
    setLines((prev) => prev.filter((l) => l.product.slug !== slug));
  }

  function setQty(slug: string, qty: number) {
    if (qty < 1) return remove(slug);
    setLines((prev) =>
      prev.map((l) => (l.product.slug === slug ? { ...l, qty } : l))
    );
  }

  function clear() {
    setLines([]);
  }

  async function checkout(
    email: string,
    currency: string
  ): Promise<CheckoutResult> {
    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currency,
          lines: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Checkout failed." };

      if (data.mode === "live" && data.link) {
        // Hand off to IntaSend hosted checkout.
        return { ok: true, mode: "live", link: data.link, orderId: data.orderId };
      }

      // Demo mode: order already marked paid server-side.
      clear();
      return { ok: true, mode: "demo", orderId: data.orderId };
    } catch {
      return { ok: false, error: "Network error — please try again." };
    }
  }

  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);

  return (
    <CartContext.Provider
      value={{ lines, add, remove, setQty, clear, count, subtotal, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
