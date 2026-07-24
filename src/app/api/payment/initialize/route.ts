import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  FLW_BASE,
  flutterwaveSecret,
  flutterwaveChargeCurrency,
  amountInCurrency,
  paymentsConfigured,
} from "@/lib/flutterwave";
import { CurrencyCode } from "@/lib/currency";

type LineInput = { slug: string; qty: number };

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const body = await req.json();
  const lines: LineInput[] = body.lines ?? [];
  const email: string | undefined = body.email ?? user?.email;
  const displayCurrency: CurrencyCode = body.currency ?? "USD";

  if (!email) {
    return NextResponse.json({ error: "An email is required." }, { status: 400 });
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Rebuild the order from trusted DB prices (never trust client amounts).
  const slugs = lines.map((l) => l.slug);
  const products = await prisma.product.findMany({ where: { slug: { in: slugs } } });
  if (products.length !== slugs.length) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 409 }
    );
  }

  const items = lines.map((line) => {
    const product = products.find((p) => p.slug === line.slug)!;
    return { productId: product.id, qty: line.qty, priceAtPurchase: product.price };
  });
  const totalUsd = items.reduce((sum, i) => sum + i.qty * i.priceAtPurchase, 0);

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      email,
      total: totalUsd,
      status: "pending",
      items: { create: items },
    },
  });

  // ── Demo mode: no Flutterwave keys yet. Mark the order paid immediately so
  // the whole flow is testable, and tell the client it was a demo. ──
  if (!paymentsConfigured()) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    return NextResponse.json({ mode: "demo", orderId: order.id });
  }

  // ── Live mode: ask Flutterwave for a hosted payment link. ──
  const chargeCurrency = flutterwaveChargeCurrency(displayCurrency);
  const amount = amountInCurrency(totalUsd, chargeCurrency);
  const origin = req.nextUrl.origin;

  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${flutterwaveSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: order.id,
      amount,
      currency: chargeCurrency,
      redirect_url: `${origin}/checkout/callback`,
      customer: { email },
      payment_options: "card,mpesa,mobilemoneyuganda,mobilemoneytanzania",
      customizations: {
        title: "Reboot Market",
        description: "Second-hand electronics, graded and warrantied",
      },
    }),
  });

  const data = await res.json();
  if (data.status !== "success" || !data.data?.link) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ mode: "live", link: data.data.link, orderId: order.id });
}
