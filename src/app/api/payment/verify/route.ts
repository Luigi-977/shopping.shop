import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by the callback page after IntaSend redirects the buyer back.
// IntaSend's hosted checkout confirms payment via webhook (the authoritative
// backstop). Here we simply report the order's current status so the UI can
// show success as soon as the webhook has landed.
export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing order reference." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, orderId, status: order.status });
}
