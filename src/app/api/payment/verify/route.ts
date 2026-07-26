import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  FLW_BASE,
  flutterwaveSecret,
  amountInCurrency,
  flutterwaveChargeCurrency,
} from "@/lib/flutterwave";
import { CurrencyCode } from "@/lib/currency";
import { formatPrice } from "@/lib/currency";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Called by the callback page after Flutterwave redirects the buyer back.
export async function POST(req: NextRequest) {
  const { transactionId, orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing order reference." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Already confirmed on a previous visit — idempotent.
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, orderId, status: "paid" });
  }

  const secret = flutterwaveSecret();
  if (!secret || !transactionId) {
    return NextResponse.json({ error: "Cannot verify payment." }, { status: 400 });
  }

  // Ask Flutterwave directly whether this transaction really succeeded.
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const data = await res.json();

  const tx = data?.data;
  const paidEnough = tx && tx.status === "successful" && tx.tx_ref === orderId;

  if (!paidEnough) {
    return NextResponse.json({ ok: false, status: "failed" });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid" },
  });

  // Send confirmation email (non-blocking). Build a short item summary.
  try {
    const full = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, user: true },
    });
    if (full) {
      const summary = full.items
        .map((i) => `${i.qty} × ${i.product.name}`)
        .join("<br/>");
      sendOrderConfirmationEmail(
        full.email,
        full.id,
        summary,
        formatPrice(full.total, "USD"),
        full.user?.name
      ).catch(() => {});
    }
  } catch {
    // never block the payment confirmation on email
  }

  return NextResponse.json({ ok: true, orderId, status: "paid" });
}
