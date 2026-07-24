"use client";

import { useCurrency } from "@/lib/currency-context";
import { CURRENCY_LIST, CurrencyCode } from "@/lib/currency";

export default function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      aria-label="Display currency"
      className="font-display text-xs border border-ink/20 rounded-md px-2 py-1.5 bg-transparent hover:border-ink/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-circuit"
    >
      {CURRENCY_LIST.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code}
        </option>
      ))}
    </select>
  );
}
