import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ShopClient from "./ShopClient";
import TrustBar from "@/components/TrustBar";

export const metadata: Metadata = {
  title: "Shop — Reboot Market",
};

export const revalidate = 60;

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
  });
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <>
      <TrustBar />
      <ShopClient products={products} categories={categories} />
    </>
  );
}
