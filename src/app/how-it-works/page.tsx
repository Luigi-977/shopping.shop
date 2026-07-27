import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Search, CreditCard, MapPin, Truck, ShieldCheck, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works — Reboot Market",
  description:
    "How buying from Reboot Market works: grading, payment, delivery estimates, and what happens if we can't deliver straight to your door.",
};

const STEPS = [
  {
    Icon: Search,
    title: "1. Browse & compare",
    body: "Every device is sorted by category, brand, condition and grade. Grade A/B/C tells you exactly what to expect — no surprises when it arrives.",
  },
  {
    Icon: ShoppingBag,
    title: "2. Check the listing",
    body: "Each product page shows real photos, full specs, an inspector's note, and star ratings from past buyers.",
  },
  {
    Icon: MapPin,
    title: "3. Check your delivery estimate",
    body: "Before you buy, pick your country on the product page. Delivery is a maximum of 3–4 working days depending on your country and how early you place the order — see the live route on the map.",
  },
  {
    Icon: CreditCard,
    title: "4. Pay your way",
    body: "Card or M-Pesa at checkout, in your local currency. Prices convert automatically using the currency switcher at the top of the site.",
  },
  {
    Icon: Truck,
    title: "5. We fly it to you",
    body: "Every order travels by air freight, not slow container ships — a maximum of 3–4 working days depending on your country and what time of day you order. A handful of countries aren't covered for direct delivery yet — see below for what happens there.",
  },
  {
    Icon: ShieldCheck,
    title: "6. Warranty & returns",
    body: "Every device carries a 60–180 day warranty and a 14-day return window if it doesn't match its listed grade.",
  },
  {
    Icon: MessageCircle,
    title: "7. Need help?",
    body: "Customer care chat and WhatsApp are open on every page — tap Help (bottom-left) or Chat (bottom-right) any time.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="font-display text-xs uppercase tracking-widest text-circuit mb-4">
        How it works
      </p>
      <h1 className="text-3xl sm:text-4xl font-medium leading-tight mb-6">
        From browsing to your doorstep — the whole process.
      </h1>
      <p className="text-ink/80 leading-relaxed mb-10 max-w-xl">
        Reboot Market ships graded, warrantied electronics from our Shenzhen
        supply hub to customers across Africa and beyond. Here&rsquo;s exactly
        what happens at each step.
      </p>

      <ol className="space-y-8">
        {STEPS.map(({ Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span className="shrink-0 w-11 h-11 rounded-full bg-circuit-soft flex items-center justify-center">
              <Icon size={20} className="text-circuit" />
            </span>
            <div>
              <h2 className="font-display font-bold text-sm uppercase tracking-wide text-ink mb-1">
                {title}
              </h2>
              <p className="text-ink/80 leading-relaxed">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t border-ink/10 pt-8">
        <h2 className="text-xl font-medium mb-3">
          What if my country isn&rsquo;t covered for direct delivery?
        </h2>
        <p className="text-ink/80 leading-relaxed mb-4 max-w-xl">
          A small number of countries — currently Canada, Turkey, Tanzania and
          Uganda — aren&rsquo;t yet covered for courier delivery straight to a
          customer&rsquo;s address. Your order still flies over by air freight
          the whole way — never sea shipping — but the last leg finishes at a
          pickup point instead of your door:
        </p>
        <ul className="space-y-2 max-w-xl mb-4">
          <li className="flex items-start gap-2 text-ink/80">
            <MapPin size={16} className="text-circuit mt-0.5 shrink-0" />
            <span>
              <strong>In Africa</strong> — orders route to our Nairobi, Kenya
              shop for pickup.
            </span>
          </li>
          <li className="flex items-start gap-2 text-ink/80">
            <MapPin size={16} className="text-circuit mt-0.5 shrink-0" />
            <span>
              <strong>Everywhere else</strong> (e.g. the Americas) — orders
              route to our London, UK hub for pickup or onward local courier.
            </span>
          </li>
        </ul>
        <p className="text-ink/80 leading-relaxed max-w-xl">
          You&rsquo;ll always see the estimated arrival time for either path
          before you check out, on the delivery map on the product page.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="font-display text-sm font-bold bg-ink text-paper rounded-md px-5 py-3 hover:bg-ink-soft transition-colors"
        >
          Start shopping
        </Link>
        <Link
          href="/contact"
          className="font-display text-sm font-bold border border-ink rounded-md px-5 py-3 hover:bg-ink hover:text-paper transition-colors"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
