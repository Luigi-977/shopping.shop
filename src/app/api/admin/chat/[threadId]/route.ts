import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

// GET: full message history for a thread; marks customer messages read.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { threadId } = await params;

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.chatMessage.updateMany({
    where: { threadId, fromAdmin: false, readByAdmin: false },
    data: { readByAdmin: true },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });
}

// POST: admin replies to the thread.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { threadId } = await params;
  const { body } = await req.json();
  if (!body || !String(body).trim()) {
    return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  }

  await prisma.chatMessage.create({
    data: { threadId, fromAdmin: true, body: String(body).slice(0, 2000), readByAdmin: true },
  });
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
