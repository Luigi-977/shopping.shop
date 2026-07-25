import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const GUEST_COOKIE = "reboot_chat_thread";

// Resolve the caller's thread: logged-in users get their user thread,
// guests get one tracked by a cookie.
async function resolveThread(create: boolean, guestName?: string, email?: string) {
  const user = await getCurrentUser();
  const store = await cookies();

  if (user) {
    let thread = await prisma.chatThread.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!thread && create) {
      thread = await prisma.chatThread.create({
        data: { userId: user.id, email: user.email, guestName: user.name },
      });
    }
    return thread;
  }

  const existingId = store.get(GUEST_COOKIE)?.value;
  if (existingId) {
    const thread = await prisma.chatThread.findUnique({ where: { id: existingId } });
    if (thread) return thread;
  }
  if (create) {
    const thread = await prisma.chatThread.create({
      data: { guestName: guestName || null, email: email || null },
    });
    store.set(GUEST_COOKIE, thread.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return thread;
  }
  return null;
}

// GET: fetch my thread messages (for polling).
export async function GET() {
  const thread = await resolveThread(false);
  if (!thread) return NextResponse.json({ messages: [] });
  const messages = await prisma.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    threadId: thread.id,
    messages: messages.map((m) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });
}

// POST: send a message (creates the thread on first message).
export async function POST(req: NextRequest) {
  const { body, guestName, email } = await req.json();
  if (!body || !String(body).trim()) {
    return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  }
  const thread = await resolveThread(true, guestName, email);
  if (!thread) {
    return NextResponse.json({ error: "Could not start chat." }, { status: 500 });
  }

  await prisma.chatMessage.create({
    data: { threadId: thread.id, fromAdmin: false, body: String(body).slice(0, 2000) },
  });
  await prisma.chatThread.update({
    where: { id: thread.id },
    data: { lastAt: new Date() },
  });

  return NextResponse.json({ ok: true, threadId: thread.id });
}
