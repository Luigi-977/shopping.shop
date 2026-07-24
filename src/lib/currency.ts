export type CurrencyCode = "USD" | "GBP" | "JPY" | "KES" | "TZS" | "UGX";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  // How many units of this currency equal 1 USD (approximate, static rates).
  perUsd: number;
  // Whole-number currencies (no decimals shown).
  noDecimals: boolean;
};

// Static approximate rates. For a production store you'd refresh these from a
// live FX API on a schedule; hard-coded is fine for display estimates.
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", perUsd: 1, noDecimals: false },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", perUsd: 0.79, noDecimals: false },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", perUsd: 157, noDecimals: true },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", perUsd: 129, noDecimals: true },
  TZS: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", perUsd: 2650, noDecimals: true },
  UGX: { code: "UGX", symbol: "USh", name: "Ugandan Shilling", perUsd: 3700, noDecimals: true },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

// Convert a USD amount to the target currency and format it with symbol.
export function formatPrice(usd: number, code: CurrencyCode): string {
  const c = CURRENCIES[code];
  const converted = usd * c.perUsd;

  if (c.noDecimals) {
    const rounded = Math.round(converted);
    const grouped = rounded.toLocaleString("en-US");
    // KSh / TSh / USh read better with a space; $ £ ¥ sit tight to the number.
    const spacer = c.symbol.length > 1 ? " " : "";
    return `${c.symbol}${spacer}${grouped}`;
  }

  const grouped = converted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${c.symbol}${grouped}`;
}
