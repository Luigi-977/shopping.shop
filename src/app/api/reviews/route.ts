import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { productId, rating, body, authorName, authorLocation } = await req.json();
  const user = await getCurrentUser();

  if (!productId || !rating || !body) {
    return NextResponse.json({ error: "Please add a rating and a comment." }, { status: 400 });
  }
  const r = Number(rating);
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }

  const name = (user?.name || authorName || "Anonymous").toString().slice(0, 60);
  const location = authorLocation ? String(authorLocation).slice(0, 60) : null;

  const review = await prisma.review.create({
    data: {
      productId,
      rating: r,
      body: String(body).slice(0, 1000),
      authorName: name,
      authorLocation: location,
    },
  });

  return NextResponse.json({ ok: true, review });
}
