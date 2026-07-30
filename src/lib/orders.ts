import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Mark an order paid and send its confirmation email. Idempotent — safe to
// call from both the checkout callback and the IntaSend webhook.
export async function markOrderPaid(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return false;
  if (order.status === "paid") return true;

  await prisma.order.update({ where: { id: orderId }, data: { status: "paid" } });

  // Reduce stock for each item bought, and auto-mark sold-out when it hits 0.
  // This runs exactly once per order because we returned early above if the
  // order was already "paid" — so stock can't be double-decremented.
  try {
    const paidOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    if (paidOrder) {
      for (const item of paidOrder.items) {
        const p = item.product;
        // Only track stock for products that have a real stock number set.
        if (typeof p.stockCount === "number") {
          const remaining = Math.max(0, p.stockCount - item.qty);
          await prisma.product.update({
            where: { id: p.id },
            data: {
              stockCount: remaining,
              // When the last unit sells, hide it from the shop automatically.
              inStock: remaining > 0 ? p.inStock : false,
            },
          });
        }
      }
    }
  } catch {
    // never block payment confirmation on stock updates
  }

  try {
    const full = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, user: true },
    });
    if (full) {
      const summary = full.items
        .map((i) => `${i.qty} x ${i.product.name}`)
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
    // never block on email
  }
  return true;
}
