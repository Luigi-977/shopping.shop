import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { name } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: name ? String(name).slice(0, 80) : null },
  });

  return NextResponse.json({ ok: true, name: updated.name });
}
