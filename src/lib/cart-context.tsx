"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Product } from "@prisma/client";

type CartLine = { product: Product; qty: number };

type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

type CartContextType = {
  lines: CartLine[];
  add: (product: Product) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  checkout: (email: string) => Promise<CheckoutResult>;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "reboot-market-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

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

  async function checkout(email: string): Promise<CheckoutResult> {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          lines: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Checkout failed." };
      clear();
      return { ok: true, orderId: data.order.id };
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
