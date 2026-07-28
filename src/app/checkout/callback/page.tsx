"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";

function CallbackInner() {
  const params = useSearchParams();
  const { clear } = useCart();
  const [state, setState] = useState<"checking" | "success" | "pending" | "failed">("checking");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // We pass ?order=<id> in the redirect_url. IntaSend may also append its own
    // params, but our order id is the reliable reference.
    const order = params.get("order");
    setOrderId(order);

    if (!order) {
      setState("failed");
      return;
    }

    let attempts = 0;
    let timer: ReturnType<typeof setInterval>;

    async function check() {
      attempts++;
      try {
        const r = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order }),
        });
        const data = await r.json();
        if (data.status === "paid") {
          clear();
          setState("success");
          clearInterval(timer);
        } else if (attempts >= 6) {
          // After ~18s with no webhook confirmation, show pending (not failure)
          // because M-Pesa can take a moment; the webhook will still confirm it.
          setState("pending");
          clearInterval(timer);
        }
      } catch {
        if (attempts >= 6) {
          setState("pending");
          clearInterval(timer);
        }
      }
    }

    check();
    timer = setInterval(check, 3000);
    return () => clearInterval(timer);
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
          You&rsquo;ll get a confirmation by email asking for your delivery details. Thank you!
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

  if (state === "pending") {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-5xl mb-6">⏳</p>
        <h1 className="text-2xl font-medium mb-3">Finalising your payment</h1>
        {orderId && (
          <p className="text-wire mb-2">Order #{orderId.slice(-8)}</p>
        )}
        <p className="text-wire mb-8 text-sm">
          If you completed the M-Pesa or card payment, it&rsquo;s being confirmed and
          you&rsquo;ll get an email shortly. You can check your account for the latest status.
        </p>
        <Link
          href="/account"
          className="inline-block bg-ink text-paper font-display text-sm px-5 py-3 rounded-md"
        >
          View my orders
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
