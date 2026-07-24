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
  price: number;
  originalPrice: number;
  grade: string;
  battery: number | null;
  warrantyDays: number;
  specs: string;
  gradeNotes: string;
  imageUrl: string | null;
  image: string;
  inStock: boolean;
};

export default function EditProductForm({ product }: { product: ProductForm }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(product.imageUrl);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setImageUrl(data.url);
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
        price: form.get("price"),
        originalPrice: form.get("originalPrice"),
        grade: form.get("grade"),
        battery: form.get("battery"),
        warrantyDays: form.get("warrantyDays"),
        specs: form.get("specs"),
        gradeNotes: form.get("gradeNotes"),
        imageUrl,
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
          <span className="block text-sm font-medium mb-2">Photo</span>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-ink/[0.05] flex items-center justify-center overflow-hidden shrink-0 text-3xl">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                product.image
              )}
            </div>
            <label className="text-sm border border-ink rounded-md px-4 py-2 cursor-pointer hover:bg-ink hover:text-paper transition-colors">
              {uploading ? "Uploading…" : imageUrl ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
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
