import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, products, GRADE_DESC } from "@/lib/products";
import GradeBadge from "@/components/GradeBadge";
import ProductCard from "@/components/ProductCard";
import AddToCart from "./AddToCart";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  return { title: product ? `${product.name} — Reboot Market` : "Not found" };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <nav className="text-sm text-wire mb-8">
        <Link href="/shop" className="hover:text-circuit">
          Shop
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-ink/[0.03] rounded-lg flex items-center justify-center text-[8rem]">
          {product.image}
        </div>

        <div>
          <p className="text-xs font-display uppercase tracking-wide text-wire mb-2">
            {product.category}
          </p>
          <h1 className="text-3xl font-medium mb-4">{product.name}</h1>

          <div className="mb-5">
            <GradeBadge grade={product.grade} size="lg" />
          </div>

          <p className="text-wire mb-6 max-w-md">{GRADE_DESC[product.grade]}</p>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-display font-bold text-3xl">
              ${product.price}
            </span>
            <span className="text-lg text-wire line-through">
              ${product.originalPrice}
            </span>
          </div>
          <p className="text-sm text-circuit font-display mb-8">
            You save {discount}% off retail
          </p>

          <AddToCart product={product} />

          <div className="mt-10 border-t border-ink/10 pt-6">
            <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-3">
              Specs
            </h2>
            <ul className="grid grid-cols-2 gap-y-2 text-sm">
              {product.specs.map((s) => (
                <li key={s} className="text-ink/80">
                  {s}
                </li>
              ))}
              {product.battery && (
                <li className="text-ink/80">Battery health: {product.battery}%</li>
              )}
              <li className="text-ink/80">{product.warrantyDays}-day warranty</li>
            </ul>
          </div>

          <div className="mt-6 border-t border-ink/10 pt-6">
            <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-3">
              Inspector&rsquo;s note
            </h2>
            <p className="text-sm text-ink/80">{product.gradeNotes}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-medium mb-6">More {product.category.toLowerCase()}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
