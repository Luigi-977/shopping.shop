import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  intasendCheckoutUrl,
  intasendPublicKey,
  intasendChargeCurrency,
  amountInCurrency,
  paymentsConfigured,
} from "@/lib/intasend";
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

  // Demo mode: no IntaSend keys yet. Mark the order paid immediately so the
  // whole flow is testable, and tell the client it was a demo.
  if (!paymentsConfigured()) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    return NextResponse.json({ mode: "demo", orderId: order.id });
  }

  // Live mode: ask IntaSend for a hosted checkout link.
  const chargeCurrency = intasendChargeCurrency(displayCurrency);
  const amount = amountInCurrency(totalUsd, chargeCurrency);
  const origin = req.nextUrl.origin;
  const firstName = (user?.name || email.split("@")[0] || "Customer").slice(0, 40);

  const res = await fetch(intasendCheckoutUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_key: intasendPublicKey(),
      amount,
      currency: chargeCurrency,
      email,
      first_name: firstName,
      last_name: "",
      api_ref: order.id,
      redirect_url: `${origin}/checkout/callback?order=${order.id}`,
      comment: "Reboot Market - refurbished electronics",
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.url) {
    // Surface IntaSend's actual reason in the server logs for debugging.
    console.error("IntaSend checkout failed:", {
      status: res.status,
      response: data,
      sent: { amount, currency: chargeCurrency, live: process.env.INTASEND_LIVE },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
    return NextResponse.json(
      {
        error: "Could not start payment. Please try again.",
        // Include IntaSend's message so we can see it during setup.
        detail: data?.detail || data?.message || data?.errors || "Unknown error",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ mode: "live", link: data.url, orderId: order.id });
}
