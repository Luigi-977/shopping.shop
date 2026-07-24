"use client";

import { useCurrency } from "@/lib/currency-context";

export default function PriceBlock({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice: number;
}) {
  const { format } = useCurrency();
  const discount = Math.round((1 - price / originalPrice) * 100);

  return (
    <>
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <span className="font-display font-bold text-3xl">{format(price)}</span>
        <span className="text-lg text-wire line-through">
          {format(originalPrice)}
        </span>
      </div>
      <p className="text-sm text-circuit font-display mb-8">
        You save {discount}% off retail
      </p>
    </>
  );
}
