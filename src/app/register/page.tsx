"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    await refresh();
    router.push("/account");
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-medium mb-1">Create an account</h1>
      <p className="text-wire mb-8 text-sm">
        Already have one? <Link href="/login" className="text-circuit hover:underline">Log in</Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="name">
            Name <span className="text-wire font-normal">(optional)</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="password">
            Password <span className="text-wire font-normal">(8+ characters)</span>
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
          />
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-display text-sm px-5 py-3 rounded-md hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
