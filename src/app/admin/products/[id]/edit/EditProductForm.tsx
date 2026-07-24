"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Phones",
  "Laptops",
  "TVs",
  "Sound Systems",
  "Fridges",
  "Tablets",
  "Cameras",
  "Gaming",
  "Monitors",
];

type ProductForm = {
  id: string;
  name: string;
  category: string;
  brand: string;
  condition: string;
  price: number;
  originalPrice: number;
  grade: string;
  battery: number | null;
  warrantyDays: number;
  specs: string;
  dimensions: string;
  description: string;
  refurbDetails: string;
  gradeNotes: string;
  imageUrl: string | null;
  imageUrls: string[];
  image: string;
  inStock: boolean;
};

export default function EditProductForm({ product }: { product: ProductForm }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : []
  );
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("file", f));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setImageUrls((prev) => [...prev, ...(data.urls ?? [])]);
  }

  function removePhoto(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        category: form.get("category"),
        brand: form.get("brand"),
        condition: form.get("condition"),
        price: form.get("price"),
        originalPrice: form.get("originalPrice"),
        grade: form.get("grade"),
        battery: form.get("battery"),
        warrantyDays: form.get("warrantyDays"),
        specs: form.get("specs"),
        dimensions: form.get("dimensions"),
        description: form.get("description"),
        refurbDetails: form.get("refurbDetails"),
        gradeNotes: form.get("gradeNotes"),
        imageUrls,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/products"), 900);
  }

  const inputClass =
    "w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit";

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Edit product</h1>
      <p className="text-wire mb-8">{product.name}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <span className="block text-sm font-medium mb-2">
            Photos <span className="text-wire font-normal">(buyers swipe through these)</span>
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {imageUrls.map((url) => (
              <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden bg-ink/[0.05]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink text-paper text-xs flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
            {imageUrls.length === 0 && (
              <div className="w-20 h-20 rounded-lg bg-ink/[0.05] flex items-center justify-center text-3xl">
                {product.image}
              </div>
            )}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-ink/25 flex items-center justify-center cursor-pointer hover:border-ink/50 transition-colors text-2xl">
              {uploading ? "…" : "+"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">Product name</label>
          <input id="name" name="name" required defaultValue={product.name} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="category">Category</label>
            <select id="category" name="category" defaultValue={product.category} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="brand">Brand</label>
            <input id="brand" name="brand" defaultValue={product.brand} className={inputClass} />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">Condition</span>
          <select name="condition" defaultValue={product.condition} className={inputClass}>
            <option value="New">New</option>
            <option value="Refurbished">Refurbished</option>
            <option value="Used">Used</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="price">Price (USD)</label>
            <input id="price" name="price" type="number" min={0} required defaultValue={product.price} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="originalPrice">Original (USD)</label>
            <input id="originalPrice" name="originalPrice" type="number" min={0} required defaultValue={product.originalPrice} className={inputClass} />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">Grade</span>
          <select name="grade" defaultValue={product.grade} className={inputClass}>
            <option value="A">Grade A — looks new</option>
            <option value="B">Grade B — light wear</option>
            <option value="C">Grade C — well used</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="battery">Battery %</label>
            <input id="battery" name="battery" type="number" min={0} max={100} defaultValue={product.battery ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="warrantyDays">Warranty (days)</label>
            <input id="warrantyDays" name="warrantyDays" type="number" min={0} defaultValue={product.warrantyDays} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="specs">Specs (comma-separated)</label>
          <input id="specs" name="specs" defaultValue={product.specs} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="dimensions">Size / dimensions</label>
          <input id="dimensions" name="dimensions" defaultValue={product.dimensions} placeholder='e.g. 6.1" screen' className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="description">Full description</label>
          <textarea id="description" name="description" rows={3} defaultValue={product.description} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="refurbDetails">Refurbishment details</label>
          <textarea id="refurbDetails" name="refurbDetails" rows={2} defaultValue={product.refurbDetails} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="gradeNotes">Condition notes</label>
          <textarea id="gradeNotes" name="gradeNotes" rows={2} defaultValue={product.gradeNotes} className={inputClass} />
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}
        {done && <p className="text-sm text-circuit">Saved ✓</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-ink text-paper font-display text-sm px-5 py-3.5 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
