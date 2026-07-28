import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const productId = req.nextUrl.searchParams.get("productId");
  const reviews = await prisma.review.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const b = await req.json();
  const { productId, authorName, authorLocation, rating, body, photoUrl, videoUrl } = b;

  if (!productId || !authorName || !body || !rating) {
    return NextResponse.json({ error: "Product, name, rating, and review text are required." }, { status: 400 });
  }
  const r = Number(rating);
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      productId,
      authorName: String(authorName).slice(0, 60),
      authorLocation: authorLocation ? String(authorLocation).slice(0, 60) : null,
      rating: r,
      body: String(body).slice(0, 1000),
      photoUrl: photoUrl || null,
      videoUrl: videoUrl || null,
    },
  });

  return NextResponse.json({ ok: true, review });
}