import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const b = await req.json();

  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.category !== undefined) data.category = b.category;
  if (b.brand !== undefined) data.brand = b.brand || null;
  if (b.condition !== undefined) data.condition = b.condition;
  if (b.price !== undefined) data.price = Number(b.price);
  if (b.originalPrice !== undefined) data.originalPrice = Number(b.originalPrice);
  if (b.grade !== undefined) data.grade = b.grade;
  if (b.battery !== undefined) data.battery = b.battery ? Number(b.battery) : null;
  if (b.warrantyDays !== undefined) data.warrantyDays = Number(b.warrantyDays);
  if (b.description !== undefined) data.description = b.description || null;
  if (b.dimensions !== undefined) data.dimensions = b.dimensions || null;
  if (b.refurbDetails !== undefined) data.refurbDetails = b.refurbDetails || null;
  if (b.gradeNotes !== undefined) data.gradeNotes = b.gradeNotes;
  if (b.imageUrl !== undefined) data.imageUrl = b.imageUrl || null;
  if (b.imageUrls !== undefined) data.imageUrls = Array.isArray(b.imageUrls) ? b.imageUrls : [];
  if (b.inStock !== undefined) data.inStock = Boolean(b.inStock);
  if (b.stockCount !== undefined) {
    data.stockCount =
      b.stockCount === "" || b.stockCount === null ? null : Number(b.stockCount);
  }
  if (b.specs !== undefined) {
    data.specs = Array.isArray(b.specs)
      ? b.specs
      : String(b.specs || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
  }

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  // Soft-delete: hide from shop but keep for order history integrity.
  await prisma.product.update({ where: { id }, data: { inStock: false } });
  return NextResponse.json({ ok: true });
}
