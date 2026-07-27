"use client";

import { useMemo, useState } from "react";
import type { Product } from "@prisma/client";
import { Grade } from "@/lib/grading";
import ProductCard from "@/components/ProductCard";

type SortMode = "best-grade" | "price-low" | "price-high" | "newest";

const GRADE_RANK: Record<string, number> = { A: 0, B: 1, C: 2 };

export default function ShopClient({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [sort, setSort] = useState<SortMode>("best-grade");
  const [query, setQuery] = useState("");

  const conditions = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.condition).filter(Boolean))).sort(),
    [products]
  );

  // Brands available within the current category selection.
  const brandsForCategory = useMemo(() => {
    const pool = category
      ? products.filter((p) => p.category === category)
      : products;
    return Array.from(
      new Set(pool.map((p) => p.brand).filter((b): b is string => Boolean(b)))
    ).sort();
  }, [products, category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (condition && p.condition !== condition) return false;
      if (grade && p.grade !== grade) return false;
      if (q) {
        const haystack = `${p.name} ${p.category} ${p.brand ?? ""} ${p.specs.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "best-grade":
          // Best grade first; within a grade, cheaper first.
          if (GRADE_RANK[a.grade] !== GRADE_RANK[b.grade])
            return GRADE_RANK[a.grade] - GRADE_RANK[b.grade];
          return a.price - b.price;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return list;
  }, [products, category, brand, condition, grade, sort, query]);

  function pickCategory(c: string | null) {
    setCategory(c);
    setBrand(null); // reset brand when category changes
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-28">
      <h1 className="text-2xl font-medium mb-1">Shop</h1>
      <p className="text-wire mb-4">{filtered.length} devices in stock</p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search phones, laptops, brands…"
        className="w-full border border-ink/20 rounded-md px-4 py-3 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit mb-6"
      />

      {/* Category row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => pickCategory(null)}
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
            onClick={() => pickCategory(c)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              category === c
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 hover:border-ink/50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Brand sub-filter row (shows brands within the chosen category) */}
      {brandsForCategory.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3 pl-1 border-l-2 border-signal/40">
          <span className="text-xs font-display uppercase text-wire self-center pl-1 pr-1">
            Brand:
          </span>
          <button
            onClick={() => setBrand(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              brand === null
                ? "bg-circuit text-paper border-circuit"
                : "border-ink/20 hover:border-ink/50"
            }`}
          >
            All
          </button>
          {brandsForCategory.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                brand === b
                  ? "bg-circuit text-paper border-circuit"
                  : "border-ink/20 hover:border-ink/50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Condition filter: New / Refurbished / Used */}
      <div className="flex flex-wrap gap-2 mb-3 pl-1 pr-14 border-l-2 border-circuit/40">
        <span className="text-xs font-display uppercase text-wire self-center pl-1 pr-1">
          Condition:
        </span>
        <button
          onClick={() => setCondition(null)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            condition === null
              ? "bg-ink text-paper border-ink"
              : "border-ink/20 hover:border-ink/50"
          }`}
        >
          All
        </button>
        {conditions.map((c) => (
          <button
            key={c}
            onClick={() => setCondition(condition === c ? null : c)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              condition === c
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 hover:border-ink/50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grade + sort row */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pl-1 pr-14">
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
        <span className="w-px bg-ink/15 mx-1 self-stretch" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          aria-label="Sort products"
          className="text-sm font-display border border-ink/20 rounded-full px-3 py-1.5 bg-transparent hover:border-ink/50 focus:outline-none focus:ring-2 focus:ring-circuit cursor-pointer"
        >
          <option value="best-grade">Best grade first</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
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
