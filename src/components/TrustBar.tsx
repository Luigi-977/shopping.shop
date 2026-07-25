const SIGNALS = [
  { icon: "🛡️", title: "Warranty on all", sub: "60–180 days" },
  { icon: "✅", title: "40-point checked", sub: "every device" },
  { icon: "↩️", title: "14-day returns", sub: "if not as graded" },
  { icon: "🚚", title: "Fast delivery", sub: "local & regional" },
];

export default function TrustBar() {
  return (
    <div className="border-y border-ink/10 bg-white/50">
      <div className="max-w-6xl mx-auto px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SIGNALS.map((s) => (
          <div key={s.title} className="flex items-center gap-2">
            <span className="text-xl shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink leading-tight">{s.title}</p>
              <p className="text-[11px] text-wire leading-tight">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
