import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Visit: /api/make-admin?key=YOUR_SECRET&email=you@example.com
// Promotes that account to admin. Requires ADMIN_SETUP_SECRET to be set in the
// environment so random people can't promote themselves.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const email = req.nextUrl.searchParams.get("email");
  const expected = process.env.ADMIN_SETUP_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SETUP_SECRET is not set on the server." },
      { status: 500 }
    );
  }
  if (key !== expected) {
    return NextResponse.json({ error: "Invalid key." }, { status: 401 });
  }
  if (!email) {
    return NextResponse.json({ error: "Add &email= to the URL." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: `No account found for ${email}. Register first, then try again.` },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  return NextResponse.json({ ok: true, email, role: "admin" });
}
