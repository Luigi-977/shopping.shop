import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catalog } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const expected = process.env.SEED_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "SEED_SECRET is not set on the server." },
      { status: 500 }
    );
  }
  if (key !== expected) {
    return NextResponse.json({ error: "Invalid key." }, { status: 401 });
  }

  for (const p of catalog) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  return NextResponse.json({ ok: true, seeded: catalog.length });
}
