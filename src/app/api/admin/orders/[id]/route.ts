import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

// PATCH: change an order's status (e.g. cancel, or mark shipped).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const allowed = ["pending", "paid", "shipped", "cancelled"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  const order = await prisma.order.update({ where: { id }, data: { status } });
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
