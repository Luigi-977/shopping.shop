import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const b = await req.json();
  const required = ["name", "category", "price", "originalPrice", "grade"];
  for (const field of required) {
    if (b[field] === undefined || b[field] === "") {
      return NextResponse.json({ error: `Missing: ${field}` }, { status: 400 });
    }
  }

  let slug = slugify(b.name);
  // Ensure uniqueness.
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const emojiByCategory: Record<string, string> = {
    Phones: "📱",
    Laptops: "💻",
    TVs: "📺",
    "Sound Systems": "🔊",
    Fridges: "🧊",
    Tablets: "📱",
    Cameras: "📷",
    Gaming: "🎮",
    Monitors: "🖥️",
  };

  const product = await prisma.product.create({
    data: {
      slug,
      name: b.name,
      category: b.category,
      brand: b.brand || null,
      price: Number(b.price),
      originalPrice: Number(b.originalPrice),
      grade: b.grade,
      battery: b.battery ? Number(b.battery) : null,
      warrantyDays: b.warrantyDays ? Number(b.warrantyDays) : 60,
      seller: b.seller || "reboot-market",
      specs: Array.isArray(b.specs)
        ? b.specs
        : String(b.specs || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
      gradeNotes: b.gradeNotes || "",
      image: emojiByCategory[b.category] || "📦",
      imageUrl: b.imageUrl || null,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
