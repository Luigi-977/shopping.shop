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

export default function NewProductForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    const res = await fetch("/api/admin/products", {
      method: "POST",
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
      setError(data.error ?? "Could not save product.");
      return;
    }
    router.push("/shop");
  }

  const inputClass =
    "w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit";

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Add a product</h1>
      <p className="text-wire mb-8">
        Snap a photo and fill in the details. It goes live in the shop immediately.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <div>
          <span className="block text-sm font-medium mb-2">
            Photos <span className="text-wire font-normal">(add several — buyers can swipe through them)</span>
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
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-ink/25 flex items-center justify-center cursor-pointer hover:border-ink/50 transition-colors text-2xl">
              {uploading ? "…" : "+"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Product name
          </label>
          <input id="name" name="name" required placeholder="e.g. iPhone 14 Pro 256GB" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="category">
              Category
            </label>
            <select id="category" name="category" className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="brand">
              Brand
            </label>
            <input id="brand" name="brand" placeholder="e.g. Apple" className={inputClass} />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">Condition</span>
          <select name="condition" className={inputClass} defaultValue="Refurbished">
            <option value="New">New</option>
            <option value="Refurbished">Refurbished</option>
            <option value="Used">Used</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="price">
              Price (USD)
            </label>
            <input id="price" name="price" type="number" min={0} required placeholder="449" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="originalPrice">
              Original price (USD)
            </label>
            <input id="originalPrice" name="originalPrice" type="number" min={0} required placeholder="799" className={inputClass} />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">Grade</span>
          <select name="grade" className={inputClass} defaultValue="A">
            <option value="A">Grade A — looks new</option>
            <option value="B">Grade B — light wear</option>
            <option value="C">Grade C — well used</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="battery">
              Battery % <span className="text-wire font-normal">(optional)</span>
            </label>
            <input id="battery" name="battery" type="number" min={0} max={100} placeholder="90" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="warrantyDays">
              Warranty (days)
            </label>
            <input id="warrantyDays" name="warrantyDays" type="number" min={0} defaultValue={60} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="specs">
            Specs <span className="text-wire font-normal">(comma-separated)</span>
          </label>
          <input id="specs" name="specs" placeholder="128GB, Blue, Unlocked" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="dimensions">
            Size / dimensions <span className="text-wire font-normal">(optional)</span>
          </label>
          <input id="dimensions" name="dimensions" placeholder='e.g. 6.1" screen, 146 x 71 x 7.8 mm' className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="description">
            Full description
          </label>
          <textarea id="description" name="description" rows={3} placeholder="Tell buyers about the product — features, what's included, why it's a good buy." className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="refurbDetails">
            Refurbishment details <span className="text-wire font-normal">(what was done)</span>
          </label>
          <textarea id="refurbDetails" name="refurbDetails" rows={2} placeholder="e.g. New battery fitted, screen replaced, factory reset, 40-point tested." className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="gradeNotes">
            Condition notes
          </label>
          <textarea id="gradeNotes" name="gradeNotes" rows={2} placeholder="Small scratch on the frame, screen flawless." className={inputClass} />
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-ink text-paper font-display text-sm px-5 py-3.5 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add to shop"}
        </button>
      </form>
    </div>
  );
}
