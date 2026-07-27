"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import { RotateCcw } from "lucide-react";
import landTopology from "@/lib/geo/land-110m.json";

type Point = { name: string; lat: number; lon: number };

const SIZE = 440;
const CENTER: [number, number] = [SIZE / 2, SIZE / 2 - 4];
const RADIUS = SIZE / 2 - 14;

const land = feature(
  landTopology as unknown as Topology,
  (landTopology as unknown as Topology).objects.land as GeometryCollection
) as unknown as FeatureCollection<Geometry>;

const graticule = geoGraticule10();

function routeLine(a: Point, b: Point) {
  const interpolate = geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
  const steps = 64;
  const coords = Array.from({ length: steps + 1 }, (_, i) => interpolate(i / steps));
  return { type: "LineString" as const, coordinates: coords };
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

  // Default rotation centers the globe on the midpoint of the route so
  // both ends are always visible on the front face.
  const defaultRotation = useMemo<[number, number]>(() => {
    const mid = geoInterpolate([origin.lon, origin.lat], [destination.lon, destination.lat])(0.5);
    return [-mid[0], -mid[1]];
  }, [origin, destination]);

  const [rotation, setRotation] = useState(defaultRotation);
  const dragRef = useRef<{ x: number; y: number; rot: [number, number] } | null>(null);
  const [dragging, setDragging] = useState(false);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .rotate([rotation[0], rotation[1], 0])
        .translate(CENTER)
        .scale(RADIUS)
        .clipAngle(90),
    [rotation]
  );

  const path = useMemo(() => geoPath(projection), [projection]);

  const landPath = useMemo(() => path(land) ?? "", [path]);
  const graticulePath = useMemo(() => path(graticule) ?? "", [path]);
  const spherePath = useMemo(() => path({ type: "Sphere" }) ?? "", [path]);

  const routePath = useMemo(() => {
    const legs = waypoint
      ? [routeLine(origin, waypoint), routeLine(waypoint, destination)]
      : [routeLine(origin, destination)];
    return legs.map((l) => path(l) ?? "");
  }, [origin, destination, waypoint, path]);

  const markers = useMemo(
    () => [
      { key: "origin" as const, pt: origin, color: "#3c7a5f" },
      ...(waypoint ? [{ key: "waypoint" as const, pt: waypoint, color: "#9aa0a6" }] : []),
      { key: "destination" as const, pt: destination, color: "#ffb000" },
    ],
    [origin, destination, waypoint]
  );

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, rot: rotation };
    setDragging(true);
  }

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    const [startLambda, startPhi] = dragRef.current.rot;
    const nextPhi = Math.max(-90, Math.min(90, startPhi - dy * 0.4));
    setRotation([startLambda + dx * 0.4, nextPhi]);
  }, []);

  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  const showReset =
    Math.abs(rotation[0] - defaultRotation[0]) > 1 || Math.abs(rotation[1] - defaultRotation[1]) > 1;

  return (
    <div className="relative rounded-lg border border-ink/10 bg-[#0a1216] overflow-hidden">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={`w-full h-auto block ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <defs>
          <radialGradient id="ocean" cx="35%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#1c3a44" />
            <stop offset="60%" stopColor="#0f242c" />
            <stop offset="100%" stopColor="#081418" />
          </radialGradient>
          <radialGradient id="atmosphere" cx="35%" cy="32%" r="60%">
            <stop offset="80%" stopColor="#3c7a5f" stopOpacity="0" />
            <stop offset="100%" stopColor="#5fb98c" stopOpacity="0.35" />
          </radialGradient>
        </defs>

        <rect width={SIZE} height={SIZE} fill="#0a1216" />

        {/* soft atmosphere glow behind the globe */}
        <circle cx={CENTER[0]} cy={CENTER[1]} r={RADIUS + 6} fill="url(#atmosphere)" />

        {/* ocean sphere */}
        <path d={spherePath} fill="url(#ocean)" />
        {/* graticule (lat/long grid), subtle */}
        <path d={graticulePath} fill="none" stroke="#2a4048" strokeWidth={0.5} />
        {/* real continents */}
        <path d={landPath} fill="#274a3f" stroke="#3c7a5f" strokeWidth={0.6} />
        {/* sphere outline */}
        <path d={spherePath} fill="none" stroke="#3c7a5f" strokeOpacity={0.5} strokeWidth={1} />

        {/* route arc(s) */}
        {routePath.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i === 0 ? "#ffb000" : "#9aa0a6"}
            strokeWidth={2}
            strokeDasharray="1 4"
            strokeLinecap="round"
            opacity={0.9}
          />
        ))}

        {/* markers */}
        {markers.map(({ key, pt, color }) => {
          const [x, y] = projection([pt.lon, pt.lat]) ?? [0, 0];
          return (
            <g key={key} onPointerEnter={() => setHover(key)} onPointerLeave={() => setHover(null)}>
              <circle cx={x} cy={y} r={10} fill={color} opacity={0.2} />
              <circle cx={x} cy={y} r={4} fill={color} stroke="#0a1216" strokeWidth={1.5} />
              {hover === key && (
                <g>
                  <rect
                    x={x + 8}
                    y={y - 18}
                    width={pt.name.length * 6 + 12}
                    height={18}
                    rx={3}
                    fill="#14181c"
                  />
                  <text x={x + 14} y={y - 5} fill="#edeae2" fontSize="10">
                    {pt.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {showReset && (
        <button
          onClick={() => setRotation(defaultRotation)}
          className="absolute top-2 left-2 flex items-center gap-1 text-[10px] bg-ink/70 text-paper px-2 py-1 rounded-full backdrop-blur"
        >
          <RotateCcw size={11} />
          Reset view
        </button>
      )}

      <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-paper/70">
          {origin.name} {waypoint ? `→ ${waypoint.name} → ` : "→"} {destination.name}
        </span>
        <span className="text-signal font-semibold">{etaLabel}</span>
      </div>
      <p className="px-3 pb-2 text-[10px] text-paper/40">Drag the globe to look around</p>
    </div>
  );
}
