"use client";

import { useState } from "react";
import type { Product } from "@prisma/client";
import { useCart } from "@/lib/cart-context";
import { useCurrency } from "@/lib/currency-context";

type Choice = "refurbished" | "new";

export default function ConditionChooser({ product }: { product: Product }) {
  const { add } = useCart();
  const { format } = useCurrency();
  const [added, setAdded] = useState(false);

  const hasNew =
    typeof product.newPrice === "number" && product.newPrice > 0;

  // If a new version exists, default to whichever is in stock; else refurbished.
  const [choice, setChoice] = useState<Choice>(
    hasNew && !product.inStock && product.newInStock ? "new" : "refurbished"
  );

  const refurbishedAvailable = product.inStock;
  const newAvailable = hasNew && product.newInStock;

  const selectedPrice =
    choice === "new" && hasNew ? (product.newPrice as number) : product.price;
  const selectedAvailable =
    choice === "new" ? newAvailable : refurbishedAvailable;

  const discount = Math.round((1 - selectedPrice / product.originalPrice) * 100);

  function handleAdd() {
    // Add the product to cart with the price for the chosen condition. We pass
    // a lightweight override so the cart charges the right amount.
    add({
      ...product,
      price: selectedPrice,
      condition: choice === "new" ? "New" : product.condition,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div>
      {/* Side-by-side condition options (only when a New version exists) */}
      {hasNew && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setChoice("refurbished")}
            disabled={!refurbishedAvailable}
            className={`text-left border rounded-lg p-3 transition-colors ${
              choice === "refurbished"
                ? "border-ink bg-ink/[0.03] ring-1 ring-ink"
                : "border-ink/20 hover:border-ink/40"
            } ${!refurbishedAvailable ? "opacity-50" : ""}`}
          >
            <p className="font-display text-xs uppercase tracking-wide text-wire mb-1">
              Refurbished
            </p>
            <p className="font-display font-bold text-lg">{format(product.price)}</p>
            <p className="text-[11px] text-wire mt-0.5">
              {refurbishedAvailable ? `Grade ${product.grade}` : "Sold out"}
            </p>
          </button>

          <button
            onClick={() => setChoice("new")}
            disabled={!newAvailable}
            className={`text-left border rounded-lg p-3 transition-colors ${
              choice === "new"
                ? "border-ink bg-ink/[0.03] ring-1 ring-ink"
                : "border-ink/20 hover:border-ink/40"
            } ${!newAvailable ? "opacity-50" : ""}`}
          >
            <p className="font-display text-xs uppercase tracking-wide text-circuit mb-1">
              Brand New
            </p>
            <p className="font-display font-bold text-lg">
              {format(product.newPrice as number)}
            </p>
            <p className="text-[11px] text-wire mt-0.5">
              {newAvailable ? "Sealed, full warranty" : "Sold out"}
            </p>
          </button>
        </div>
      )}

      {/* Selected price summary */}
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <span className="font-display font-bold text-3xl">{format(selectedPrice)}</span>
        <span className="text-lg text-wire line-through">
          {format(product.originalPrice)}
        </span>
      </div>
      {discount > 0 && (
        <p className="text-sm text-circuit font-display mb-6">
          You save {discount}% off retail
        </p>
      )}

      {/* Add to cart / sold out */}
      {selectedAvailable ? (
        <button
          onClick={handleAdd}
          className="w-full sm:w-auto bg-ink text-paper font-display text-sm px-6 py-3 rounded-md hover:bg-ink-soft transition-colors"
        >
          {added
            ? "Added to cart ✓"
            : `Add ${choice === "new" ? "new" : "refurbished"} to cart`}
        </button>
      ) : (
        <div className="bg-ink/[0.04] border border-ink/10 rounded-md px-5 py-4 text-center">
          <p className="font-display font-bold text-sm">Sold out</p>
          <p className="text-xs text-wire mt-1">
            Waiting for new stock — message us to be notified when it&rsquo;s back.
          </p>
        </div>
      )}
    </div>
  );
}
