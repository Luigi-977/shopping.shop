// Lightweight client-side text translation using Google's free,
// unauthenticated "gtx" endpoint — the same underlying service the
// page-wide TranslateWidget already relies on, just for single strings
// instead of the whole DOM.

export const CHAT_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "am", label: "አማርኛ" },
  { code: "so", label: "Soomaali" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "zh-CN", label: "中文" },
];

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = "auto"
): Promise<string> {
  if (!text.trim() || targetLang === sourceLang) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    // Response shape: [[[translated, original, ...], ...], ...]
    const translated = Array.isArray(data?.[0])
      ? data[0].map((chunk: unknown[]) => chunk?.[0] ?? "").join("")
      : text;
    return translated || text;
  } catch {
    // Network hiccup or blocked endpoint — fall back to the original text
    // rather than breaking the chat.
    return text;
  }
}
