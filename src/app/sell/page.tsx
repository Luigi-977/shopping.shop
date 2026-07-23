"use client";

import { useState } from "react";
import GradeBadge from "@/components/GradeBadge";
import { Grade } from "@/lib/grading";

export default function SellPage() {
  const [submitted, setSubmitted] = useState(false);
  const [grade, setGrade] = useState<Grade>("A");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        category: form.get("category"),
        grade,
        askingPrice: form.get("asking"),
        email: form.get("email"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-5xl mb-6">✓</p>
        <h1 className="text-2xl font-medium mb-3">Listing submitted</h1>
        <p className="text-wire">
          Saved to our review queue. Our team will confirm the grade and get
          back to you by email before it goes live.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-2">Sell your device</h1>
      <p className="text-wire mb-8">
        Tell us what you&rsquo;ve got. Every device gets a free inspection
        before it&rsquo;s listed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Device name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. iPhone 14 Pro, 256GB"
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          >
            <option>Phones</option>
            <option>Laptops</option>
            <option>Tablets</option>
            <option>Cameras</option>
            <option>Gaming</option>
            <option>Audio</option>
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">
            How would you grade its condition?
          </span>
          <div className="flex gap-2">
            {(["A", "B", "C"] as Grade[]).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGrade(g)}
                className={`flex-1 rounded-md p-3 border text-left transition-colors ${
                  grade === g ? "border-ink bg-ink/[0.03]" : "border-ink/15"
                }`}
              >
                <GradeBadge grade={g} size="sm" />
              </button>
            ))}
          </div>
          <p className="text-xs text-wire mt-2">
            Our inspector will confirm the final grade before listing.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="asking">
            Asking price (USD)
          </label>
          <input
            id="asking"
            name="asking"
            type="number"
            min={0}
            required
            placeholder="250"
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">
            Your email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-display text-sm px-5 py-3.5 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit for inspection"}
        </button>
      </form>
    </div>
  );
}
