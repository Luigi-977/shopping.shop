import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { GRADE_DESC, Grade } from "@/lib/grading";
import GradeBadge from "@/components/GradeBadge";
import ProductCard from "@/components/ProductCard";
import AddToCart from "./AddToCart";
import PriceBlock from "./PriceBlock";
import AskAboutItem from "./AskAboutItem";
import ImageCarousel from "@/components/ImageCarousel";
import ReviewSection from "./ReviewSection";
import DeliveryEstimator from "@/components/DeliveryEstimator";

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
  if (!product) return { title: "Not found" };

  const desc = `${product.condition} ${product.name} — Grade ${product.grade}, ${product.warrantyDays}-day warranty. ${product.gradeNotes} Buy with card or M-Pesa, delivery across Kenya.`;
  const photo = (product.imageUrls && product.imageUrls[0]) || product.imageUrl;

  return {
    title: `${product.name} (${product.condition})`,
    description: desc.slice(0, 160),
    openGraph: {
      title: `${product.name} — ${product.condition}, graded & warrantied`,
      description: desc.slice(0, 200),
      images: photo ? [{ url: photo }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Reboot Market`,
      description: desc.slice(0, 200),
      images: photo ? [photo] : undefined,
    },
  };
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

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, approved: true },
    orderBy: { createdAt: "desc" },
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
        <ImageCarousel
          images={[
            ...(product.imageUrls ?? []),
            ...(product.imageUrl && !(product.imageUrls ?? []).includes(product.imageUrl)
              ? [product.imageUrl]
              : []),
          ]}
          fallbackEmoji={product.image}
          alt={product.name}
        />

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

          {product.inStock ? (
            <AddToCart product={product} />
          ) : (
            <div className="bg-ink/[0.04] border border-ink/10 rounded-md px-5 py-4 text-center">
              <p className="font-display font-bold text-sm">Sold out</p>
              <p className="text-xs text-wire mt-1">
                Waiting for new stock — message us to be notified when it&rsquo;s back.
              </p>
            </div>
          )}

          <AskAboutItem productName={product.name} grade={product.grade} />

          <DeliveryEstimator />

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

      <ReviewSection
        productId={product.id}
        initialReviews={reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          rating: r.rating,
          body: r.body,
          createdAt: r.createdAt.toISOString(),
        }))}
      />

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
