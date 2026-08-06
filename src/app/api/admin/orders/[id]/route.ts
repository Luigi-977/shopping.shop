import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { markOrderPaid } from "@/lib/orders";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

// PATCH: change an order's status (e.g. cancel, or mark shipped), edit its
// date, or manually confirm payment (for cases like a gateway holding funds
// during account review even though the customer genuinely paid).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  // Manually confirming payment runs the exact same logic as a real webhook:
  // marks paid, decrements stock, sends the confirmation email. Idempotent.
  if (body.markPaid) {
    const ok = await markOrderPaid(id);
    if (!ok) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    const order = await prisma.order.findUnique({ where: { id } });
    return NextResponse.json({ ok: true, order });
  }

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    const allowed = ["pending", "paid", "shipped", "cancelled"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.createdAt !== undefined) {
    const d = new Date(body.createdAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }
    data.createdAt = d;
  }

  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json({ ok: true, order });
}

// DELETE: permanently remove an order and its items.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  // Order items cascade-delete via the schema relation.
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
