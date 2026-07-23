"use client";

import { useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import { Grade } from "@/lib/grading";
import ProductCard from "@/components/ProductCard";

export default function ShopClient({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (grade && p.grade !== grade) return false;
      return true;
    });
  }, [products, category, grade]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Shop</h1>
      <p className="text-wire mb-8">{filtered.length} devices in stock</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategory(null)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            category === null
              ? "bg-ink text-paper border-ink"
              : "border-ink/20 hover:border-ink/50"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              category === c
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 hover:border-ink/50"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="w-px bg-ink/15 mx-1" />
        {(["A", "B", "C"] as Grade[]).map((g) => (
          <button
            key={g}
            onClick={() => setGrade(grade === g ? null : g)}
            className={`text-sm font-display px-3 py-1.5 rounded-full border transition-colors ${
              grade === g
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 hover:border-ink/50"
            }`}
          >
            Grade {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-wire py-16 text-center">
          Nothing matches those filters yet — try widening your search.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
