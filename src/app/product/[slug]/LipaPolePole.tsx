"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/contact";
import { useCurrency } from "@/lib/currency-context";

// Installment enquiry: shows an estimated 3-month plan and lets the buyer
// message to arrange it. This is an enquiry tool, not automated financing.
export default function LipaPolePole({
  productName,
  price,
}: {
  productName: string;
  price: number;
}) {
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);

  const deposit = Math.round(price * 0.4);
  const monthly = Math.round((price - deposit) / 2);

  const message = `Hi Reboot Market, I'd like to buy the ${productName} on Lipa Pole Pole (installments). Can we arrange a plan?`;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 border border-signal bg-signal/10 rounded-md px-4 py-3 hover:bg-signal/20 transition-colors"
      >
        <span className="font-display text-sm font-bold text-ink">
          💳 Pay in installments — Lipa Pole Pole
        </span>
        <span className="text-wire text-sm">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border border-ink/10 border-t-0 rounded-b-md px-4 py-4 -mt-1">
          <p className="text-sm text-ink/80 mb-3">
            Spread the cost over 3 months. Here&rsquo;s an example plan:
          </p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-wire">Deposit today (40%)</span>
              <span className="font-display font-bold">{format(deposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wire">Then 2 monthly payments of</span>
              <span className="font-display font-bold">{format(monthly)}</span>
            </div>
          </div>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-[#25D366] text-white font-display text-sm font-bold px-5 py-3 rounded-md hover:brightness-95 transition"
          >
            Arrange installments on WhatsApp
          </a>
          <p className="text-[11px] text-wire mt-2 text-center">
            Final terms are agreed directly with us. Subject to approval.
          </p>
        </div>
      )}
    </div>
  );
}
