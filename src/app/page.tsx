import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function Home() {
  const featured = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-16">
        <div className="max-w-2xl">
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
