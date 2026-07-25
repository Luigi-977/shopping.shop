import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const threads = await prisma.chatThread.findMany({
    orderBy: { lastAt: "desc" },
    include: {
      user: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: { messages: { where: { fromAdmin: false, readByAdmin: false } } },
      },
    },
  });

  return NextResponse.json({
    threads: threads.map((t) => ({
      id: t.id,
      name: t.user?.name || t.guestName || "Guest",
      email: t.user?.email || t.email || null,
      lastMessage: t.messages[0]?.body ?? "",
      lastAt: t.lastAt,
      unread: t._count.messages,
    })),
  });
}
