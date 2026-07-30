"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AdminProduct = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  grade: string;
  price: number;
  image: string;
  imageUrl: string | null;
  hasPhoto: boolean;
};

export default function AdminProductList({
  products,
}: {
  products: AdminProduct[];
}) {
  const [query, setQuery] = useState("");
  const [onlyNoPhoto, setOnlyNoPhoto] = useState(false);
  const [list, setList] = useState(products);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes it from your shop.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setList((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Could not delete. Please try again.");
      }
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      if (onlyNoPhoto && p.hasPhoto) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q)
      );
    });
  }, [list, query, onlyNoPhoto]);

  const withPhoto = list.filter((p) => p.hasPhoto).length;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-1 gap-4">
        <h1 className="text-2xl font-medium">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink text-paper font-display text-sm px-4 py-2.5 rounded-md hover:bg-ink-soft transition-colors shrink-0"
        >
          + Add
        </Link>
      </div>
      <p className="text-wire mb-5">
        {list.length} products · {withPhoto} with photos
      </p>

      {/* Search box */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, brand, or category…"
        className="w-full border border-ink/20 rounded-md px-4 py-3 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit mb-3"
      />

      <label className="flex items-center gap-2 text-sm text-wire mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={onlyNoPhoto}
          onChange={(e) => setOnlyNoPhoto(e.target.checked)}
          className="accent-ink"
        />
        Show only products still missing a photo
      </label>

      {filtered.length === 0 ? (
        <p className="text-wire py-12 text-center">No products match “{query}”.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border border-ink/10 rounded-lg p-3"
            >
              <Link
                href={`/admin/products/${p.id}/edit`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="w-14 h-14 rounded-md bg-ink/[0.04] flex items-center justify-center text-2xl overflow-hidden shrink-0">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.image
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-wire">
                    {p.category}
                    {p.brand ? ` · ${p.brand}` : ""} · Grade {p.grade} · ${p.price}
                  </p>
                </div>
              </Link>
              {!p.hasPhoto && (
                <span className="text-xs font-display text-rust border border-rust/40 rounded px-2 py-0.5 shrink-0">
                  No photo
                </span>
              )}
              <button
                onClick={() => handleDelete(p.id, p.name)}
                disabled={deleting === p.id}
                className="text-xs font-display text-rust border border-rust/30 rounded px-3 py-1.5 hover:bg-rust hover:text-paper transition-colors shrink-0 disabled:opacity-50"
              >
                {deleting === p.id ? "…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
