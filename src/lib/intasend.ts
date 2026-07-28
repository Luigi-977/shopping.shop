import { CurrencyCode, CURRENCIES } from "./currency";

// IntaSend is a Kenyan gateway (M-Pesa + cards), licensed by the Central Bank
// of Kenya. It exposes a Checkout Link API: POST an order, get a hosted
// payment URL, redirect the customer there. Same shape as the old Flutterwave
// flow, so the rest of the app barely changes.

// IntaSend collects in KES, USD, EUR, GBP. We map our display currencies to
// what it can charge; anything else falls back to KES (its home currency).
const INTASEND_SUPPORTED: CurrencyCode[] = ["USD", "GBP", "KES"];

export function intasendChargeCurrency(display: CurrencyCode): CurrencyCode {
  return INTASEND_SUPPORTED.includes(display) ? display : "KES";
}

// Convert a USD base amount into the charge currency's actual amount.
export function amountInCurrency(usd: number, code: CurrencyCode): number {
  const rate = CURRENCIES[code].perUsd;
  const raw = usd * rate;
  return CURRENCIES[code].noDecimals ? Math.round(raw) : Math.round(raw * 100) / 100;
}

// Sandbox for testing, live for real money. We detect "live" from the key
// itself (live keys contain "_live_") so it can't be misconfigured, and also
// honour an explicit INTASEND_LIVE=true override.
export function isLive(): boolean {
  const pub = process.env.INTASEND_PUBLIC_KEY ?? "";
  if (pub.includes("_live_")) return true;
  if (pub.includes("_test_")) return false;
  return process.env.INTASEND_LIVE === "true";
}

export function intasendCheckoutUrl(): string {
  return isLive()
    ? "https://payment.intasend.com/api/v1/checkout/"
    : "https://sandbox.intasend.com/api/v1/checkout/";
}

export function intasendPublicKey(): string | null {
  return process.env.INTASEND_PUBLIC_KEY ?? null;
}

export function intasendSecretKey(): string | null {
  return process.env.INTASEND_SECRET_KEY ?? null;
}

// Payments are "configured" once we have the public key (needed for checkout).
export function paymentsConfigured(): boolean {
  return Boolean(process.env.INTASEND_PUBLIC_KEY);
}
