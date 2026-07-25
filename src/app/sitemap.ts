import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = "https://shopping-shop-ashy.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({ select: { slug: true } });
    productUrls = products.map((p) => ({
      url: `${BASE}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If the DB is briefly unreachable at build time, still ship a valid sitemap.
  }

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1 },
    { url: `${BASE}/shop`, priority: 0.9 },
    { url: `${BASE}/about`, priority: 0.5 },
    { url: `${BASE}/contact`, priority: 0.5 },
    { url: `${BASE}/policies`, priority: 0.4 },
    { url: `${BASE}/sell`, priority: 0.5 },
  ].map((u) => ({ ...u, changeFrequency: "monthly" as const }));

  return [...staticUrls, ...productUrls];
}
