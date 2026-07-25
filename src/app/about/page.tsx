import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Reboot Market",
  description:
    "Who we are: graded, warrantied second-hand and refurbished electronics, sourced carefully and sold honestly.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="font-display text-xs uppercase tracking-widest text-circuit mb-4">
        About us
      </p>
      <h1 className="text-3xl sm:text-4xl font-medium leading-tight mb-6">
        Honest electronics, graded and warrantied.
      </h1>

      <div className="space-y-5 text-ink/80 leading-relaxed">
        <p>
          Reboot Market exists for one reason: buying second-hand electronics
          online shouldn&rsquo;t feel like a gamble. Too many people have been
          burned by a phone that looked great in the photos and arrived
          scratched, or a laptop with a battery that barely lasts an hour.
        </p>
        <p>
          We do it differently. Every device we list — whether it&rsquo;s
          brand new, refurbished, or gently used — is inspected, tested, and
          graded before it goes on the shelf. Our A/B/C grade tells you exactly
          what to expect, so the item that arrives is the item you chose.
        </p>
        <p>
          We source stock from trusted suppliers and refurbishment partners,
          restore what needs restoring, and pass the savings on to you. Phones,
          laptops, TVs, cameras, fridges, sound systems and more — all covered
          by a warranty, all priced fairly.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        <div className="border border-ink/10 rounded-lg p-5">
          <p className="font-display text-2xl font-bold text-circuit mb-1">40+</p>
          <p className="text-sm text-wire">point inspection on every device</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-5">
          <p className="font-display text-2xl font-bold text-circuit mb-1">60–180</p>
          <p className="text-sm text-wire">day warranty on every order</p>
        </div>
        <div className="border border-ink/10 rounded-lg p-5">
          <p className="font-display text-2xl font-bold text-circuit mb-1">14</p>
          <p className="text-sm text-wire">day free returns if not as graded</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="bg-ink text-paper font-display text-sm px-5 py-3 rounded-md hover:bg-ink-soft transition-colors"
        >
          Browse the shop
        </Link>
        <Link
          href="/contact"
          className="border border-ink font-display text-sm px-5 py-3 rounded-md hover:bg-ink hover:text-paper transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
