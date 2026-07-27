"use client";

import Link from "next/link";
import type { Product } from "@prisma/client";
import { Grade } from "@/lib/grading";
import { useCurrency } from "@/lib/currency-context";
import GradeBadge from "./GradeBadge";
import Stars from "./Stars";

type ProductWithReviews = Product & { reviews?: { rating: number }[] };

export default function ProductCard({ product }: { product: ProductWithReviews }) {
  const { format } = useCurrency();
  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100
  );
  const reviews = product.reviews ?? [];
  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white border border-ink/10 rounded-lg overflow-hidden hover:shadow-md hover:border-ink/20 transition-all"
    >
      <div className="aspect-square flex items-center justify-center text-6xl bg-ink/[0.03] relative overflow-hidden">
        {(() => {
          const photo = (product.imageUrls && product.imageUrls[0]) || product.imageUrl;
          return photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            product.image
          );
        })()}
        <div className="absolute top-3 left-3">
          <GradeBadge grade={product.grade as Grade} size="sm" />
        </div>
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-flash text-white text-[11px] font-display font-bold rounded px-1.5 py-0.5 shadow-sm">
            −{discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-paper/70 flex items-center justify-center">
            <span className="font-display text-xs font-bold uppercase bg-ink text-paper px-3 py-1.5 rounded">
              Sold out
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[11px] font-display uppercase tracking-wide text-wire">
            {product.category}
          </p>
          <span className="text-[10px] font-display uppercase tracking-wide text-circuit border border-circuit/30 rounded px-1.5 py-0.5">
            {product.condition}
          </span>
        </div>
        <h3 className="font-medium text-ink leading-snug mb-1.5 text-sm group-hover:underline decoration-flash decoration-2 underline-offset-2 line-clamp-2">
          {product.name}
        </h3>
        {avgRating !== null && (
          <div className="flex items-center gap-1 mb-1.5">
            <Stars rating={avgRating} size={12} />
            <span className="text-[11px] text-wire">({reviews.length})</span>
          </div>
        )}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-display font-extrabold text-base text-ink">
            {format(product.price)}
          </span>
          <span className="text-xs text-wire line-through">
            {format(product.originalPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
