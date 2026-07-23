import Link from "next/link";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import GradeBadge from "@/components/GradeBadge";

export default function Home() {
  const featured = products.slice(0, 4);

  return (
    <>
      {/* Hero: framed like a listing spec sheet — the grade is the thesis */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-circuit mb-4">
            Condition you can trust
          </p>
          <h1 className="text-4xl sm:text-5xl font-medium leading-[1.05] tracking-tight mb-5">
            Every device graded.
            <br />
            Every grade honest.
          </h1>
          <p className="text-wire text-lg mb-8 max-w-md">
            We inspect, test, and grade every phone, laptop, and camera
            A through C before it&rsquo;s listed — so you know exactly what
            shows up at your door.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="bg-ink text-paper font-display text-sm px-5 py-3 rounded-md hover:bg-ink-soft transition-colors"
            >
              Browse the shop
            </Link>
            <Link
              href="/sell"
              className="border border-ink font-display text-sm px-5 py-3 rounded-md hover:bg-ink hover:text-paper transition-colors"
            >
              Sell your device
            </Link>
          </div>
        </div>

        {/* Signature element: the grade key rendered like a hardware spec tag */}
        <div id="grading" className="bg-ink text-paper rounded-xl p-7 font-display">
          <p className="text-xs uppercase tracking-widest text-paper/50 mb-5">
            The grading key
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <GradeBadge grade="A" size="md" />
              <p className="text-sm text-paper/70 mt-0.5">
                No visible scratches beyond 30cm. Screen and body like new.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <GradeBadge grade="B" size="md" />
              <p className="text-sm text-paper/70 mt-0.5">
                Minor scuffs on the body, screen is clean. Works perfectly.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <GradeBadge grade="C" size="md" />
              <p className="text-sm text-paper/70 mt-0.5">
                Visible wear and scratches. Fully functional, priced for it.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-paper/15 text-xs text-paper/50">
            Every device ships with a minimum 60-day warranty.
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl font-medium">Just listed</h2>
          <Link href="/shop" className="text-sm text-circuit hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-5 py-10 grid sm:grid-cols-3 gap-8 font-display text-sm">
          <div>
            <p className="text-signal mb-1">01</p>
            <p className="text-paper/70">
              40-point inspection on every device before listing
            </p>
          </div>
          <div>
            <p className="text-signal mb-1">02</p>
            <p className="text-paper/70">
              60&ndash;180 day warranty, no exceptions
            </p>
          </div>
          <div>
            <p className="text-signal mb-1">03</p>
            <p className="text-paper/70">
              Free returns within 14 days if it&rsquo;s not as graded
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
