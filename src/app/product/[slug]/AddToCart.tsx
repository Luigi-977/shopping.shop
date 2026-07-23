"use client";

import { useState } from "react";
import type { Product } from "@prisma/client";
import { useCart } from "@/lib/cart-context";

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        add(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
      className="w-full sm:w-auto bg-ink text-paper font-display text-sm px-6 py-3 rounded-md hover:bg-ink-soft transition-colors"
    >
      {added ? "Added to cart ✓" : "Add to cart"}
    </button>
  );
}
