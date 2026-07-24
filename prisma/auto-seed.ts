import { PrismaClient } from "@prisma/client";
import { catalog } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  // Only seed if the catalog is empty, so real edits made later in the admin
  // or database aren't overwritten on every deploy.
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Catalog already has ${count} products — skipping auto-seed.`);
    return;
  }

  for (const p of catalog) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`Auto-seeded ${catalog.length} products.`);
}

main()
  .catch((e) => {
    // Never fail the build just because seeding hit a snag.
    console.error("Auto-seed skipped due to error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
