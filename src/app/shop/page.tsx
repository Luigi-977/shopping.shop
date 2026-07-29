import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ShopClient from "./ShopClient";
import TrustBar from "@/components/TrustBar";

export const metadata: Metadata = {
  title: "Shop — Reboot Market",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ inStock: "desc" }, { createdAt: "desc" }],
    include: { reviews: { where: { approved: true }, select: { rating: true } } },
  });
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      <TrustBar />
      <Suspense fallback={null}>
        <ShopClient products={products} categories={categories} />
      </Suspense>
    </>
  );
}
