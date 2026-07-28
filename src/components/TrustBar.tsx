import { ShieldCheck, BadgeCheck, RotateCcw, Truck } from "lucide-react";

const SIGNALS = [
  { Icon: ShieldCheck, title: "Warranty on all", sub: "60–180 days" },
  { Icon: BadgeCheck, title: "40-point checked", sub: "every device" },
  { Icon: RotateCcw, title: "14-day returns", sub: "if not as graded" },
  { Icon: Truck, title: "Fast delivery", sub: "local & regional" },
];

export default function TrustBar() {
  return (
    <div className="border-y border-ink/10 bg-white/50">
      <div className="max-w-6xl mx-auto px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SIGNALS.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-2">
            <span className="shrink-0 w-8 h-8 rounded-full bg-circuit-soft flex items-center justify-center">
              <Icon size={16} strokeWidth={2} className="text-circuit" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink leading-tight">{title}</p>
              <p className="text-[11px] text-wire leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
