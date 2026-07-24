import { PrismaClient } from "@prisma/client";
import { catalog } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  for (const p of catalog) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${catalog.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
