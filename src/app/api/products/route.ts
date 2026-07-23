import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const grade = req.nextUrl.searchParams.get("grade");

  const products = await prisma.product.findMany({
    where: {
      inStock: true,
      ...(category ? { category } : {}),
      ...(grade ? { grade } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

// Admin-only: add a new product listing to the catalog.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const required = [
    "slug",
    "name",
    "category",
    "price",
    "originalPrice",
    "grade",
    "warrantyDays",
    "seller",
    "gradeNotes",
    "image",
  ];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const product = await prisma.product.create({
    data: {
      slug: body.slug,
      name: body.name,
      category: body.category,
      price: body.price,
      originalPrice: body.originalPrice,
      grade: body.grade,
      battery: body.battery ?? null,
      warrantyDays: body.warrantyDays,
      seller: body.seller,
      specs: body.specs ?? [],
      gradeNotes: body.gradeNotes,
      image: body.image,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
