"use client";

import { useState } from "react";
import { Play, Trash2, ImagePlus, Video, MapPin } from "lucide-react";
import Stars from "@/components/Stars";

type ProductOption = { id: string; name: string; slug: string };
type ReviewRow = {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  authorLocation: string | null;
  rating: number;
  body: string;
  photoUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
};

export default function AdminReviewsClient({
  products,
  initialReviews,
}: {
  products: ProductOption[];
  initialReviews: ReviewRow[];
}) {
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [authorName, setAuthorName] = useState("");
  const [authorLocation, setAuthorLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function uploadFile(file: File, kind: "photo" | "video") {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "reviews");
    const setLoading = kind === "photo" ? setUploadingPhoto : setUploadingVideo;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      if (kind === "photo") setPhotoUrl(data.url);
      else setVideoUrl(data.url);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!productId || !authorName.trim() || !body.trim()) {
      setError("Product, customer name, and review text are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        authorName,
        authorLocation,
        rating,
        body,
        photoUrl,
        videoUrl,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save review.");
      return;
    }
    const product = products.find((p) => p.id === productId);
    setReviews((prev) => [
      {
        id: data.review.id,
        productId,
        productName: product?.name ?? "",
        authorName: data.review.authorName,
        authorLocation: data.review.authorLocation,
        rating: data.review.rating,
        body: data.review.body,
        photoUrl: data.review.photoUrl,
        videoUrl: data.review.videoUrl,
        createdAt: data.review.createdAt,
      },
      ...prev,
    ]);
    setAuthorName("");
    setAuthorLocation("");
    setRating(5);
    setBody("");
    setPhotoUrl(null);
    setVideoUrl(null);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }

  async function removeReview(id: string) {
    if (!confirm("Delete this review? This can't be undone.")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
  }

  const inputClass =
    "w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit";

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Reviews</h1>
      <p className="text-wire mb-8">
        Add real customer testimonials — from physical sales, WhatsApp, wherever you collected them.
      </p>

      <div className="border border-ink/10 rounded-lg p-5 mb-10 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="product">Product</label>
          <select
            id="product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={inputClass}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="authorName">Customer name</label>
            <input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Grace M."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="authorLocation">City, country</label>
            <input
              id="authorLocation"
              value={authorLocation}
              onChange={(e) => setAuthorLocation(e.target.value)}
              placeholder="e.g. Kisumu, Kenya"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-1.5">Rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                aria-label={`${i} stars`}
                className="text-2xl leading-none"
                style={{ color: i <= rating ? "#ffb000" : "#cbd0d3" }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="body">What they said</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Their actual words — honest ones included."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-sm font-medium mb-1.5">Photo (optional)</span>
            {photoUrl ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-ink/[0.05]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink text-paper text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-ink/25 flex items-center justify-center cursor-pointer hover:border-ink/50 transition-colors">
                {uploadingPhoto ? "…" : <ImagePlus size={20} className="text-wire" />}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "photo")}
                />
              </label>
            )}
          </div>
          <div>
            <span className="block text-sm font-medium mb-1.5">Video (optional, &lt;60MB)</span>
            {videoUrl ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-ink/[0.05] flex items-center justify-center">
                <Play size={22} className="text-circuit" />
                <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink text-paper text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-ink/25 flex items-center justify-center cursor-pointer hover:border-ink/50 transition-colors">
                {uploadingVideo ? "…" : <Video size={20} className="text-wire" />}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "video")}
                />
              </label>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}
        {done && <p className="text-sm text-circuit">Saved ✓</p>}

        <button
          onClick={submit}
          disabled={saving || uploadingPhoto || uploadingVideo}
          className="w-full bg-ink text-paper font-display text-sm px-5 py-3 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add review"}
        </button>
      </div>

      <h2 className="text-lg font-medium mb-4">All reviews ({reviews.length})</h2>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="border border-ink/10 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-wire mb-1">{r.productName}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{r.authorName}</span>
                  {r.authorLocation && (
                    <span className="flex items-center gap-0.5 text-xs text-wire">
                      <MapPin size={11} className="text-circuit" />
                      {r.authorLocation}
                    </span>
                  )}
                  <Stars rating={r.rating} size={13} />
                </div>
                <p className="text-sm text-ink/80 mt-1">{r.body}</p>
                <div className="flex items-center gap-2 mt-2">
                  {r.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photoUrl} alt="" className="w-12 h-12 rounded object-cover" />
                  )}
                  {r.videoUrl && (
                    <span className="flex items-center gap-1 text-xs text-circuit">
                      <Play size={12} /> video
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeReview(r.id)}
                aria-label="Delete review"
                className="text-wire hover:text-rust shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-wire text-sm">No reviews yet — add the first one above.</p>
        )}
      </div>
    </div>
  );
}
