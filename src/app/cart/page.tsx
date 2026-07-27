"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";
import { useAuth } from "@/lib/auth-context";
import GradeBadge from "@/components/GradeBadge";
import { Grade } from "@/lib/grading";

export default function CartPage() {
  const { lines, remove, setQty, subtotal, checkout } = useCart();
  const { user } = useAuth();
  const { format, currency } = useCurrency();
  const [email, setEmail] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    const checkoutEmail = user?.email ?? email;
    if (!checkoutEmail) {
      setError("Enter an email so we can send your order confirmation.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await checkout(checkoutEmail, currency);
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }
    if (result.mode === "live") {
      // Redirect to Flutterwave's hosted card/M-Pesa checkout.
      window.location.href = result.link;
      return;
    }
    // Demo mode: order completed instantly.
    setLoading(false);
    setPlacedOrderId(result.orderId);
  }

  if (placedOrderId) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-5xl mb-6">✓</p>
        <h1 className="text-2xl font-medium mb-3">Order placed</h1>
        <p className="text-wire mb-2">
          Order #{placedOrderId.slice(-8)} was saved to the database.
        </p>
        <p className="text-wire mb-8 text-sm">
          This is a demo checkout — no real payment was taken. Once your
          Flutterwave keys are added, this same button will charge cards and
          M-Pesa for real.
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
        {lines.map(({ product, qty }) => {
          const photo = (product.imageUrls && product.imageUrls[0]) || product.imageUrl;
          return (
            <div key={product.slug} className="py-5 flex gap-4">
              <Link
                href={`/product/${product.slug}`}
                className="w-24 h-24 rounded-md bg-ink/[0.03] border border-ink/10 flex items-center justify-center text-3xl shrink-0 overflow-hidden"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  product.image
                )}
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link href={`/product/${product.slug}`} className="font-medium leading-snug hover:underline">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <GradeBadge grade={product.grade as Grade} size="sm" />
                    <span className="text-xs text-wire">{product.condition}</span>
                  </div>
                  <p className="text-xs text-circuit mt-1">In stock</p>
                </div>

                <div className="flex items-end justify-between mt-3 gap-3">
                  <div className="inline-flex items-center border border-ink/20 rounded-md overflow-hidden">
                    <button
                      onClick={() => setQty(product.slug, qty - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-ink/[0.04] text-lg leading-none"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-display text-sm border-x border-ink/20 h-8 flex items-center justify-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(product.slug, qty + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-ink/[0.04] text-lg leading-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => remove(product.slug)}
                    className="text-xs text-wire hover:text-rust underline underline-offset-2"
                    aria-label={`Remove ${product.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-display font-bold">{format(product.price * qty)}</p>
                {qty > 1 && (
                  <p className="text-xs text-wire mt-0.5">{format(product.price)} each</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-6 mb-6">
        <span />
        <div className="text-right">
          <p className="text-sm text-wire mb-1">Subtotal</p>
          <p className="font-display font-bold text-2xl">{format(subtotal)}</p>
        </div>
      </div>

      {!user && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" htmlFor="checkout-email">
            Email for order confirmation
          </label>
          <input
            id="checkout-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
          <p className="text-xs text-wire mt-1.5">
            Or <Link href="/login" className="text-circuit hover:underline">log in</Link> to check out faster.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-rust mb-4">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-ink text-paper font-display text-sm px-5 py-4 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        {loading ? "Starting payment…" : `Pay ${format(subtotal)}`}
      </button>
    </div>
  );
}
