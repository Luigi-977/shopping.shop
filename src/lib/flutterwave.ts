import { CurrencyCode, CURRENCIES } from "./currency";

// Flutterwave supports these currencies for collection. We map our display
// currencies to what Flutterwave can actually charge in. KES/USD/GBP are
// directly supported; for others we fall back to USD at checkout.
const FLW_SUPPORTED: CurrencyCode[] = ["USD", "GBP", "KES", "UGX", "TZS"];

export function flutterwaveChargeCurrency(display: CurrencyCode): CurrencyCode {
  return FLW_SUPPORTED.includes(display) ? display : "USD";
}

// Convert a USD base amount into the charge currency's actual amount.
export function amountInCurrency(usd: number, code: CurrencyCode): number {
  const rate = CURRENCIES[code].perUsd;
  const raw = usd * rate;
  // Whole-number currencies must not have decimals.
  return CURRENCIES[code].noDecimals ? Math.round(raw) : Math.round(raw * 100) / 100;
}

export const FLW_BASE = "https://api.flutterwave.com/v3";

export function flutterwaveSecret(): string | null {
  return process.env.FLUTTERWAVE_SECRET_KEY ?? null;
}

// Whether we're running against real keys or still in demo mode.
export function paymentsConfigured(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}
