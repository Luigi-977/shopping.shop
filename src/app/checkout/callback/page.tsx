"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";

function CallbackInner() {
  const params = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<"checking" | "success" | "failed">("checking");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Flutterwave returns: status, tx_ref (our order id), transaction_id
    const status = params.get("status");
    const txRef = params.get("tx_ref");
    const transactionId = params.get("transaction_id");
    setOrderId(txRef);

    if (status === "cancelled" || !txRef) {
      setState("failed");
      return;
    }

    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, orderId: txRef }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.status === "paid") {
          clear();
          setState("success");
        } else {
          setState("failed");
        }
      })
      .catch(() => setState("failed"));
  }, [params, clear]);

  if (state === "checking") {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-2xl font-display animate-pulse">Confirming your payment…</p>
        <p className="text-wire mt-3">One moment while we check with the payment provider.</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-5xl mb-6">✓</p>
        <h1 className="text-2xl font-medium mb-3">Payment received</h1>
        {orderId && (
          <p className="text-wire mb-2">Order #{orderId.slice(-8)} is confirmed and paid.</p>
        )}
        <p className="text-wire mb-8 text-sm">
          You&rsquo;ll get a confirmation by email. Thank you!
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

  return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <p className="text-5xl mb-6">✕</p>
      <h1 className="text-2xl font-medium mb-3">Payment not completed</h1>
      <p className="text-wire mb-8 text-sm">
        Your card or mobile money was not charged. You can try again from your cart.
      </p>
      <Link
        href="/cart"
        className="inline-block bg-ink text-paper font-display text-sm px-5 py-3 rounded-md"
      >
        Back to cart
      </Link>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-5 py-24 text-center">
          <p className="text-2xl font-display">Loading…</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
