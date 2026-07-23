import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "pixel-8-pro-graphite",
    name: "Pixel 8 Pro",
    category: "Phones",
    price: 429,
    originalPrice: 999,
    grade: "A",
    battery: 94,
    warrantyDays: 90,
    seller: "verified-reseller",
    specs: ["128GB", "Graphite", "Unlocked", "Snapdragon 8 Gen 3"],
    gradeNotes: "Screen protector on since day one, barely used.",
    image: "📱",
  },
  {
    slug: "macbook-pro-14-m2",
    name: "MacBook Pro 14\u2033",
    category: "Laptops",
    price: 999,
    originalPrice: 1999,
    grade: "A",
    battery: 91,
    warrantyDays: 180,
    seller: "certified-refurb",
    specs: ["M2 Pro", "16GB RAM", "512GB SSD", "Space Gray"],
    gradeNotes: "Corporate lease return, professionally reset.",
    image: "💻",
  },
  {
    slug: "iphone-13-blue",
    name: "iPhone 13",
    category: "Phones",
    price: 289,
    originalPrice: 699,
    grade: "B",
    battery: 86,
    warrantyDays: 90,
    seller: "verified-reseller",
    specs: ["128GB", "Blue", "Unlocked"],
    gradeNotes: "Small hairline scratch on the frame, screen is flawless.",
    image: "📱",
  },
  {
    slug: "sony-a7iii",
    name: "Sony A7 III",
    category: "Cameras",
    price: 1099,
    originalPrice: 1999,
    grade: "B",
    warrantyDays: 60,
    seller: "camera-collective",
    specs: ["24.2MP", "12,400 shutter count", "Body only"],
    gradeNotes: "Grip shows light brassing. Sensor clean, shutter tested.",
    image: "📷",
  },
  {
    slug: "ipad-air-5",
    name: "iPad Air (5th gen)",
    category: "Tablets",
    price: 349,
    originalPrice: 599,
    grade: "A",
    battery: 97,
    warrantyDays: 90,
    seller: "certified-refurb",
    specs: ["64GB", "Wi-Fi", "Starlight"],
    gradeNotes: "Open-box return, plastic film still on the back.",
    image: "📱",
  },
  {
    slug: "dell-xps-13",
    name: "Dell XPS 13",
    category: "Laptops",
    price: 549,
    originalPrice: 1299,
    grade: "C",
    battery: 78,
    warrantyDays: 60,
    seller: "verified-reseller",
    specs: ["i7-1165G7", "16GB RAM", "512GB SSD"],
    gradeNotes: "Visible keyboard shine and a dent on the lid corner. Runs great.",
    image: "💻",
  },
  {
    slug: "nintendo-switch-oled",
    name: "Switch OLED",
    category: "Gaming",
    price: 199,
    originalPrice: 349,
    grade: "B",
    warrantyDays: 60,
    seller: "game-exchange",
    specs: ["White dock", "64GB", "Joy-Cons tested for drift"],
    gradeNotes: "A few scratches on the dock, console screen is clean.",
    image: "🎮",
  },
  {
    slug: "sonos-move",
    name: "Sonos Move",
    category: "Audio",
    price: 179,
    originalPrice: 399,
    grade: "A",
    battery: 92,
    warrantyDays: 90,
    seller: "audio-outpost",
    specs: ["Bluetooth + Wi-Fi", "Shungite Black"],
    gradeNotes: "Barely used, still smells like the box.",
    image: "🔊",
  },
  {
    slug: "canon-r6",
    name: "Canon EOS R6",
    category: "Cameras",
    price: 1349,
    originalPrice: 2499,
    grade: "A",
    warrantyDays: 90,
    seller: "camera-collective",
    specs: ["20.1MP", "8,900 shutter count", "Body only"],
    gradeNotes: "Studio unit, kept in a case between shoots.",
    image: "📷",
  },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
