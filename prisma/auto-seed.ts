import { PrismaClient } from "@prisma/client";
import { catalog } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  // Upsert every catalog item: adds new ones, refreshes existing by slug.
  // Products you add later via the admin (with different slugs) are untouched.
  let added = 0;
  for (const p of catalog) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!existing) added++;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        // Only refresh catalog-managed fields; never clobber an uploaded photo.
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        originalPrice: p.originalPrice,
        grade: p.grade,
        battery: p.battery,
        warrantyDays: p.warrantyDays,
        seller: p.seller,
        specs: p.specs,
        gradeNotes: p.gradeNotes,
        image: p.image,
      },
      create: p,
    });
  }
  console.log(`Auto-seed complete. ${added} new products added, ${catalog.length} total in catalog.`);
}

main()
  .catch((e) => {
    // Never fail the build just because seeding hit a snag.
    console.error("Auto-seed skipped due to error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
