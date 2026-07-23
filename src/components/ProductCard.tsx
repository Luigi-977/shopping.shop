import Link from "next/link";
import { Product } from "@/lib/products";
import GradeBadge from "./GradeBadge";

export default function ProductCard({ product }: { product: Product }) {
  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-paper-dim/60 border border-ink/10 rounded-lg overflow-hidden hover:border-ink/30 transition-colors"
    >
      <div className="aspect-square flex items-center justify-center text-6xl bg-ink/[0.03] relative">
        {product.image}
        <div className="absolute top-3 left-3">
          <GradeBadge grade={product.grade} size="sm" />
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-display uppercase tracking-wide text-wire mb-1">
          {product.category}
        </p>
        <h3 className="font-medium text-ink leading-snug mb-2 group-hover:underline decoration-signal decoration-2 underline-offset-2">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-lg">
            ${product.price}
          </span>
          <span className="text-sm text-wire line-through">
            ${product.originalPrice}
          </span>
          <span className="text-xs font-display text-circuit ml-auto">
            −{discount}%
          </span>
        </div>
      </div>
    </Link>
  );
}
