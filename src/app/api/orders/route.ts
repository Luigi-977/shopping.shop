import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type CartLineInput = { slug: string; qty: number };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const lines: CartLineInput[] = body.lines ?? [];
  const email: string | undefined = body.email ?? user?.email;

  if (!email) {
    return NextResponse.json(
      { error: "An email is required to place an order." },
      { status: 400 }
    );
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const slugs = lines.map((l) => l.slug);
  const products = await prisma.product.findMany({ where: { slug: { in: slugs } } });

  if (products.length !== slugs.length) {
    return NextResponse.json(
      { error: "One or more items in your cart are no longer available." },
      { status: 409 }
    );
  }

  const items = lines.map((line) => {
    const product = products.find((p) => p.slug === line.slug)!;
    return {
      productId: product.id,
      qty: line.qty,
      priceAtPurchase: product.price,
    };
  });

  const total = items.reduce((sum, i) => sum + i.qty * i.priceAtPurchase, 0);

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      email,
      total,
      items: { create: items },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ order }, { status: 201 });
}
