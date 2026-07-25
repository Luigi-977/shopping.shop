"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AccountClient({
  initialName,
  email,
  isAdmin,
}: {
  initialName: string | null;
  email: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { refresh, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setEditing(false);
    await refresh();
    router.refresh();
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="border border-ink/20 rounded-md px-3 py-1.5 text-lg bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
            />
            <button
              onClick={save}
              disabled={saving}
              className="bg-ink text-paper text-sm font-display px-3 py-1.5 rounded-md disabled:opacity-60"
            >
              {saving ? "…" : "Save"}
            </button>
          </div>
        ) : (
          <h1 className="text-2xl font-medium mb-1 flex items-center gap-2 flex-wrap">
            {name ? `Hi, ${name}` : "Your account"}
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-display text-circuit border border-circuit/30 rounded px-2 py-0.5 hover:bg-circuit hover:text-paper transition-colors"
            >
              Edit
            </button>
          </h1>
        )}
        <p className="text-wire text-sm">{email}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-xs font-display bg-ink text-paper px-3 py-1.5 rounded-md hover:bg-ink-soft transition-colors"
          >
            Admin Till
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="text-xs font-display text-wire hover:text-rust"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
