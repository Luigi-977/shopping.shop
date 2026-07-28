"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Plane, RotateCcw, Smartphone } from "lucide-react";

const SLIDES = [
  {
    Icon: ShieldCheck,
    eyebrow: "Every device",
    title: "60–180 day warranty",
    body: "No exceptions, no fine print.",
    href: "/how-it-works",
    bg: "bg-flash",
    fg: "text-white",
  },
  {
    Icon: Plane,
    eyebrow: "Flown, not shipped",
    title: "3–4 working days",
    body: "Air freight from Shenzhen to your door.",
    href: "/how-it-works",
    bg: "bg-ink",
    fg: "text-paper",
  },
  {
    Icon: Smartphone,
    eyebrow: "Pay your way",
    title: "Card or M-Pesa",
    body: "Checkout in your local currency.",
    href: "/shop",
    bg: "bg-circuit",
    fg: "text-white",
  },
  {
    Icon: RotateCcw,
    eyebrow: "Changed your mind?",
    title: "14-day returns",
    body: "Free returns if it's not as graded.",
    href: "/how-it-works",
    bg: "bg-rust",
    fg: "text-white",
  },
];

export default function PromoCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map(({ Icon, eyebrow, title, body, href, bg, fg }) => (
          <Link
            key={title}
            href={href}
            className={`w-full shrink-0 ${bg} ${fg} px-6 py-8 flex items-center gap-4`}
          >
            <span className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-xs font-display uppercase tracking-wide opacity-80 mb-0.5">
                {eyebrow}
              </p>
              <p className="text-xl font-semibold leading-tight">{title}</p>
              <p className="text-sm opacity-85 mt-0.5">{body}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
