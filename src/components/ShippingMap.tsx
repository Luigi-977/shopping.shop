"use client";

import { useMemo, useState } from "react";

type Point = { name: string; lat: number; lon: number };

// Equirectangular projection onto a 1000x500 viewBox.
function project(lat: number, lon: number) {
  const x = ((lon + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

export default function ShippingMap({
  origin,
  destination,
  waypoint,
  etaLabel,
}: {
  origin: Point;
  destination: Point;
  waypoint?: Point;
  etaLabel: string;
}) {
  const [hover, setHover] = useState<"origin" | "destination" | "waypoint" | null>(null);

  const o = project(origin.lat, origin.lon);
  const d = project(destination.lat, destination.lon);
  const w = waypoint ? project(waypoint.lat, waypoint.lon) : null;

  // Arc control point, bowed toward the pole for a flight-path feel.
  const arc = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const bow = Math.min(70, Math.abs(a.x - b.x) * 0.18 + 20);
    return `M ${a.x} ${a.y} Q ${mx} ${my - bow} ${b.x} ${b.y}`;
  };

  const dots = useMemo(() => {
    // A light dotted grid to suggest a world map without heavy assets.
    const rows = [];
    for (let y = 20; y < 500; y += 28) {
      for (let x = 20; x < 1000; x += 28) {
        rows.push({ x, y });
      }
    }
    return rows;
  }, []);

  return (
    <div className="rounded-lg border border-ink/10 bg-[#0f1a1f] overflow-hidden">
      <svg viewBox="0 0 1000 500" className="w-full h-auto block">
        <rect width="1000" height="500" fill="#0f1a1f" />
        {dots.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={0.8} fill="#2a3a41" />
        ))}

        {w && (
          <>
            <path d={arc(o, w)} stroke="#3c7a5f" strokeWidth={1.5} fill="none" strokeDasharray="4 3" opacity={0.8} />
            <path d={arc(w, d)} stroke="#ffb000" strokeWidth={1.5} fill="none" strokeDasharray="4 3" opacity={0.9} />
          </>
        )}
        {!w && <path d={arc(o, d)} stroke="#ffb000" strokeWidth={1.5} fill="none" strokeDasharray="4 3" opacity={0.9} />}

        {[{ key: "origin" as const, p: o, pt: origin, color: "#3c7a5f" },
          ...(w ? [{ key: "waypoint" as const, p: w, pt: waypoint!, color: "#6b7280" }] : []),
          { key: "destination" as const, p: d, pt: destination, color: "#ffb000" },
        ].map(({ key, p, pt, color }) => (
          <g
            key={key}
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer"
          >
            <circle cx={p.x} cy={p.y} r={9} fill={color} opacity={0.18} />
            <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="#0f1a1f" strokeWidth={1.5} />
            {hover === key && (
              <g>
                <rect x={p.x + 8} y={p.y - 18} width={pt.name.length * 6 + 12} height={18} rx={3} fill="#14181c" />
                <text x={p.x + 14} y={p.y - 5} fill="#edeae2" fontSize="10">
                  {pt.name}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
      <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-paper/70">
          {origin.name} {w ? `→ ${waypoint!.name} → ` : "→"} {destination.name}
        </span>
        <span className="text-signal font-semibold">{etaLabel}</span>
      </div>
    </div>
  );
}
