"use client";

import { useState } from "react";
import Stars from "@/components/Stars";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export default function ReviewSection({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  async function submit() {
    if (!body.trim()) {
      setError("Please write a short comment.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, body, authorName: name }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Could not post review.");
      return;
    }
    setReviews((prev) => [
      {
        id: data.review.id,
        authorName: data.review.authorName,
        rating: data.review.rating,
        body: data.review.body,
        createdAt: data.review.createdAt,
      },
      ...prev,
    ]);
    setBody("");
    setName("");
    setShowForm(false);
  }

  return (
    <section className="mt-16 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium">Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={avg} />
              <span className="text-sm text-wire">
                {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm font-semibold border border-ink rounded-md px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
        >
          Write a review
        </button>
      </div>

      {showForm && (
        <div className="border border-ink/10 rounded-lg p-4 mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Your rating:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                aria-label={`${i} stars`}
                className="text-xl"
                style={{ color: i <= rating ? "#ffb000" : "#cbd0d3" }}
              >
                ★
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Share your experience with this product…"
            className="w-full border border-ink/20 rounded-md px-3 py-2 text-sm bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
          {error && <p className="text-sm text-rust">{error}</p>}
          <button
            onClick={submit}
            disabled={submitting}
            className="bg-ink text-paper text-sm font-display px-5 py-2.5 rounded-md disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-wire text-sm">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-ink/10 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{r.authorName}</span>
                <Stars rating={r.rating} size={13} />
              </div>
              <p className="text-sm text-ink/80">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
