import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GRADE_DESC, Grade } from "@/lib/grading";
import GradeBadge from "@/components/GradeBadge";
import ProductCard from "@/components/ProductCard";
import AddToCart from "./AddToCart";
import PriceBlock from "./PriceBlock";
import AskAboutItem from "./AskAboutItem";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product ? `${product.name} — Reboot Market` : "Not found" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { category: product.category, slug: { not: product.slug }, inStock: true },
    take: 3,
  });

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <nav className="text-sm text-wire mb-8">
        <Link href="/shop" className="hover:text-circuit">
          Shop
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-ink/[0.03] rounded-lg flex items-center justify-center text-[8rem] overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            product.image
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-display uppercase tracking-wide text-wire">
              {product.category}
            </p>
            <span className="text-xs font-display uppercase tracking-wide text-circuit border border-circuit/30 rounded px-2 py-0.5">
              {product.condition}
            </span>
          </div>
          <h1 className="text-3xl font-medium mb-4">{product.name}</h1>

          <div className="mb-5">
            <GradeBadge grade={product.grade as Grade} size="lg" />
          </div>

          <p className="text-wire mb-6 max-w-md">
            {GRADE_DESC[product.grade as Grade]}
          </p>

          <PriceBlock price={product.price} originalPrice={product.originalPrice} />

          <AddToCart product={product} />

          <AskAboutItem productName={product.name} grade={product.grade} />

          {product.description && (
            <div className="mt-6 border-t border-ink/10 pt-6">
              <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-3">
                Description
              </h2>
              <p className="text-sm text-ink/80 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-ink/10 pt-6">
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
              {product.dimensions && (
                <li className="text-ink/80">Size: {product.dimensions}</li>
              )}
              <li className="text-ink/80">{product.warrantyDays}-day warranty</li>
            </ul>
          </div>

          {product.refurbDetails && (
            <div className="mt-6 border-t border-ink/10 pt-6">
              <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-3">
                Refurbishment details
              </h2>
              <p className="text-sm text-ink/80 whitespace-pre-line">
                {product.refurbDetails}
              </p>
            </div>
          )}

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
