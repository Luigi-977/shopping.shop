"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Headset, X, Languages } from "lucide-react";
import { CHAT_LANGUAGES, translateText } from "@/lib/translate";

type Msg = { id: string; fromAdmin: boolean; body: string; createdAt: string };

export default function CareChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const [started, setStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const [lang, setLang] = useState("en");
  const [translated, setTranslated] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        if (data.messages.length > 0) setStarted(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Poll for new messages while the window is open.
  useEffect(() => {
    if (!open) return;
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [open, load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // Translate incoming admin replies into the customer's chosen language.
  // Original (English) text always stays in the database — this only
  // affects what's shown on screen.
  useEffect(() => {
    if (lang === "en") return;
    let cancelled = false;
    (async () => {
      for (const m of messages) {
        if (!m.fromAdmin) continue;
        const key = `${m.id}:${lang}`;
        if (translated[key]) continue;
        const t = await translateText(m.body, lang, "en");
        if (!cancelled) {
          setTranslated((prev) => ({ ...prev, [key]: t }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages, lang, translated]);

  async function send() {
    const body = input.trim();
    if (!body) return;
    setSending(true);
    // Optimistic append.
    setMessages((m) => [
      ...m,
      { id: `tmp-${Date.now()}`, fromAdmin: false, body, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, guestName: guestName || undefined }),
      });
      setStarted(true);
      load();
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Launcher button (bottom-left, so it doesn't stack on the WhatsApp button) */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Customer care chat"
        className="fixed bottom-5 left-5 z-50 flex items-center justify-center w-14 h-14 bg-ink text-paper rounded-full shadow-lg hover:bg-ink-soft transition"
      >
        {open ? <X size={22} /> : <Headset size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-20 left-5 z-50 w-[90vw] max-w-sm h-[60vh] max-h-[500px] bg-paper border border-ink/15 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-display font-bold text-sm">Customer care</p>
              <p className="text-xs text-paper/60">
                We usually reply within a few hours.
              </p>
            </div>
            <label className="flex items-center gap-1 shrink-0 bg-paper/10 rounded-md px-1.5 py-1">
              <Languages size={13} className="text-paper/70" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Chat language"
                className="bg-transparent text-paper text-xs focus:outline-none"
              >
                {CHAT_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-ink">
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-wire text-center mt-8">
                Send us a message and we&rsquo;ll get back to you here.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  m.fromAdmin
                    ? "bg-ink/[0.06] text-ink"
                    : "bg-circuit text-paper ml-auto"
                }`}
              >
                {m.fromAdmin && lang !== "en" ? translated[`${m.id}:${lang}`] ?? m.body : m.body}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-ink/10">
            {!started && (
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full mb-2 border border-ink/20 rounded-md px-3 py-2 text-sm bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
              />
            )}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
                className="flex-1 border border-ink/20 rounded-md px-3 py-2 text-sm bg-white/40 focus:outline-none focus:ring-2 focus:ring-circuit"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="bg-ink text-paper px-4 rounded-md text-sm font-display disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
