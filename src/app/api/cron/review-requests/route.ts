import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/lib/email";

// Runs daily via Vercel Cron (see vercel.json). Sends a "how's it going,
// leave a review" email once per order, 5+ days after it was placed —
// long enough that a real delivery has likely arrived.
export async function GET(req: NextRequest) {
  // Optional but recommended: set CRON_SECRET in Vercel env vars so this
  // endpoint can't be triggered by anyone who finds the URL.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }
  }

  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      reviewRequestSentAt: null,
      status: { in: ["paid", "shipped"] },
      createdAt: { lte: fiveDaysAgo },
    },
    include: {
      user: { select: { name: true } },
      items: { include: { product: { select: { name: true, slug: true } } } },
    },
    take: 100,
  });

  let sent = 0;
  for (const order of orders) {
    if (order.items.length === 0) continue;
    try {
      await sendReviewRequestEmail(
        order.email,
        order.id,
        order.items.map((i) => ({ name: i.product.name, slug: i.product.slug })),
        order.user?.name
      );
      await prisma.order.update({
        where: { id: order.id },
        data: { reviewRequestSentAt: new Date() },
      });
      sent++;
    } catch (e) {
      console.error(`Review-request email failed for order ${order.id}:`, e);
    }
  }

  return NextResponse.json({ ok: true, checked: orders.length, sent });
}