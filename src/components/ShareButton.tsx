"use client";

import { useState } from "react";

// Lets anyone quickly share a product. On phones it opens the native share
// sheet (WhatsApp, Facebook, etc.); otherwise it copies the link to clipboard.
export default function ShareButton({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/product/${slug}`
        : `/product/${slug}`;
    const shareText = `Check out the ${name} on Reboot Market`;

    // Native share sheet (mobile) — best for WhatsApp/Facebook.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, text: shareText, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }

    // Fallback: copy the link to the clipboard.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Last resort: show the URL so they can copy manually.
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm font-display border border-ink/20 rounded-md px-4 py-2.5 hover:border-ink transition-colors"
      aria-label="Share this product"
    >
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Link copied ✓" : "Share"}
    </button>
  );
}
