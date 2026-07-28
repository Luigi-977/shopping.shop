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
