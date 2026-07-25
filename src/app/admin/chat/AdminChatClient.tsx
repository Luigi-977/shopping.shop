"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Thread = {
  id: string;
  name: string;
  email: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
};
type Msg = { id: string; fromAdmin: boolean; body: string; createdAt: string };

export default function AdminChatClient() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/admin/chat");
    const data = await res.json();
    if (Array.isArray(data.threads)) setThreads(data.threads);
  }, []);

  const loadMessages = useCallback(async (threadId: string) => {
    const res = await fetch(`/api/admin/chat/${threadId}`);
    const data = await res.json();
    if (Array.isArray(data.messages)) setMessages(data.messages);
  }, []);

  useEffect(() => {
    loadThreads();
    const t = setInterval(loadThreads, 6000);
    return () => clearInterval(t);
  }, [loadThreads]);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id);
    const t = setInterval(() => loadMessages(active.id), 4000);
    return () => clearInterval(t);
  }, [active, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function sendReply() {
    if (!active || !reply.trim()) return;
    const body = reply.trim();
    setReply("");
    setMessages((m) => [
      ...m,
      { id: `tmp-${Date.now()}`, fromAdmin: true, body, createdAt: new Date().toISOString() },
    ]);
    await fetch(`/api/admin/chat/${active.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    loadMessages(active.id);
    loadThreads();
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-medium mb-1">Customer care</h1>
      <p className="text-wire mb-8">Messages from customers on the site.</p>

      {!active ? (
        <div className="space-y-2">
          {threads.length === 0 && (
            <p className="text-wire text-sm">No messages yet.</p>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              className="w-full text-left flex items-center gap-3 border border-ink/10 rounded-lg p-3 hover:border-ink/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-circuit-soft text-circuit flex items-center justify-center font-display font-bold shrink-0">
                {t.name[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {t.name}
                  {t.email ? <span className="text-wire font-normal"> · {t.email}</span> : ""}
                </p>
                <p className="text-sm text-wire truncate">{t.lastMessage}</p>
              </div>
              {t.unread > 0 && (
                <span className="bg-signal text-ink text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shrink-0">
                  {t.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-ink/10 rounded-lg overflow-hidden flex flex-col h-[60vh]">
          <div className="bg-ink text-paper px-4 py-3 flex items-center gap-3">
            <button onClick={() => setActive(null)} className="text-paper/70 text-sm">
              ‹ Back
            </button>
            <div>
              <p className="font-display font-bold text-sm">{active.name}</p>
              {active.email && <p className="text-xs text-paper/60">{active.email}</p>}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  m.fromAdmin
                    ? "bg-circuit text-paper ml-auto"
                    : "bg-ink/[0.06] text-ink"
                }`}
              >
                {m.body}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-ink/10 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendReply()}
              placeholder="Type your reply…"
              className="flex-1 border border-ink/20 rounded-md px-3 py-2 text-sm bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim()}
              className="bg-ink text-paper px-4 rounded-md text-sm font-display disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
