"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import GradeBadge from "@/components/GradeBadge";

export default function CartPage() {
  const { lines, remove, setQty, subtotal, clear } = useCart();
  const [placed, setPlaced] = useState(false);

  if (placed) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-5xl mb-6">✓</p>
        <h1 className="text-2xl font-medium mb-3">Order placed</h1>
        <p className="text-wire mb-8">
          This is a demo checkout — no payment was taken. Wire up a real
          payment provider (Stripe, etc.) when you&rsquo;re ready to take
          orders for real.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-ink text-paper font-display text-sm px-5 py-3 rounded-md"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <h1 className="text-2xl font-medium mb-3">Your cart is empty</h1>
        <p className="text-wire mb-8">Nothing here yet. Go find something worth rebooting.</p>
        <Link
          href="/shop"
          className="inline-block bg-ink text-paper font-display text-sm px-5 py-3 rounded-md"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-8">Your cart</h1>

      <div className="divide-y divide-ink/10 border-y border-ink/10">
        {lines.map(({ product, qty }) => (
          <div key={product.slug} className="py-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-md bg-ink/[0.03] flex items-center justify-center text-3xl shrink-0">
              {product.image}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/product/${product.slug}`} className="font-medium hover:underline">
                {product.name}
              </Link>
              <div className="mt-1">
                <GradeBadge grade={product.grade} size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(product.slug, qty - 1)}
                className="w-7 h-7 border border-ink/20 rounded flex items-center justify-center hover:border-ink"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center font-display">{qty}</span>
              <button
                onClick={() => setQty(product.slug, qty + 1)}
                className="w-7 h-7 border border-ink/20 rounded flex items-center justify-center hover:border-ink"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className="font-display font-bold w-16 text-right">
              ${product.price * qty}
            </span>
            <button
              onClick={() => remove(product.slug)}
              className="text-wire hover:text-rust text-sm ml-2"
              aria-label={`Remove ${product.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={clear} className="text-sm text-wire hover:text-rust">
          Clear cart
        </button>
        <div className="text-right">
          <p className="text-sm text-wire mb-1">Subtotal</p>
          <p className="font-display font-bold text-2xl">${subtotal}</p>
        </div>
      </div>

      <button
        onClick={() => setPlaced(true)}
        className="w-full mt-8 bg-ink text-paper font-display text-sm px-5 py-4 rounded-md hover:bg-ink-soft transition-colors"
      >
        Checkout — ${subtotal}
      </button>
    </div>
  );
}
