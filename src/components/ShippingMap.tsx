"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import { RotateCcw, Plane } from "lucide-react";
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

  const routeInfo = useMemo(() => {
    const legs: [Point, Point][] = waypoint
      ? [
          [origin, waypoint],
          [waypoint, destination],
        ]
      : [[origin, destination]];

    return legs.map(([a, b]) => {
      const interpolate = geoInterpolate([a.lon, a.lat], [b.lon, b.lat]);
      const steps = 64;
      const coords = Array.from({ length: steps + 1 }, (_, i) => interpolate(i / steps));
      const d = path({ type: "LineString" as const, coordinates: coords }) ?? "";
      const midIdx = Math.floor(steps / 2);
      const [mx, my] = projection(coords[midIdx]) ?? [0, 0];
      const [nx, ny] = projection(coords[midIdx + 1]) ?? [mx, my];
      const angle = (Math.atan2(ny - my, nx - mx) * 180) / Math.PI;
      return { d, mid: [mx, my] as [number, number], angle };
    });
  }, [origin, destination, waypoint, path, projection]);

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

  // Animate a plane travelling along the full route (origin → waypoint →
  // destination), looping, so the map feels alive like a live tracking view.
  const [progress, setProgress] = useState(0);
  const fullRoute = useMemo(() => {
    const pts = waypoint ? [origin, waypoint, destination] : [origin, destination];
    const coords: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const interp = geoInterpolate(
        [pts[i].lon, pts[i].lat],
        [pts[i + 1].lon, pts[i + 1].lat]
      );
      const steps = 80;
      for (let s = 0; s <= steps; s++) coords.push(interp(s / steps));
    }
    return coords;
  }, [origin, destination, waypoint]);

  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const DURATION = 6000; // ms for one full trip
    function tick(t: number) {
      if (start === null) start = t;
      const elapsed = (t - start) % DURATION;
      setProgress(elapsed / DURATION);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const planePos = useMemo(() => {
    if (fullRoute.length === 0) return null;
    const idx = Math.min(
      fullRoute.length - 2,
      Math.floor(progress * (fullRoute.length - 1))
    );
    const coord = fullRoute[idx];
    const next = fullRoute[idx + 1] ?? coord;
    const p = projection(coord);
    const pn = projection(next);
    if (!p || !pn) return null;
    const angle = (Math.atan2(pn[1] - p[1], pn[0] - p[0]) * 180) / Math.PI;
    return { x: p[0], y: p[1], angle };
  }, [fullRoute, progress, projection]);

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

        {/* route arc(s), flown not shipped */}
        {routeInfo.map(({ d, mid, angle }, i) => (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke={i === 0 ? "#ffb000" : "#9aa0a6"}
              strokeWidth={2}
              strokeDasharray="1 4"
              strokeLinecap="round"
              opacity={0.9}
            />
            <g transform={`translate(${mid[0]}, ${mid[1]}) rotate(${angle})`}>
              <polygon
                points="9,0 -6,-5 -2,0 -6,5"
                fill={i === 0 ? "#ffb000" : "#9aa0a6"}
                stroke="#0a1216"
                strokeWidth={0.6}
              />
            </g>
          </g>
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
        {/* Animated plane travelling the route */}
        {planePos && (
          <g
            transform={`translate(${planePos.x}, ${planePos.y}) rotate(${planePos.angle})`}
            style={{ pointerEvents: "none" }}
          >
            <circle r={7} fill="#ffb000" opacity={0.25}>
              <animate
                attributeName="r"
                values="6;10;6"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>
            {/* simple plane shape pointing along travel direction */}
            <path
              d="M9 0 L-5 4 L-2 0 L-5 -4 Z"
              fill="#ffffff"
              stroke="#14181c"
              strokeWidth={0.6}
            />
          </g>
        )}
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
        <span className="text-paper/70 flex items-center gap-1.5">
          <Plane size={12} className="text-signal shrink-0" />
          {origin.name} {waypoint ? `→ ${waypoint.name} → ` : "→"} {destination.name}
        </span>
        <span className="text-signal font-semibold">{etaLabel}</span>
      </div>
      <p className="px-3 pb-2 text-[10px] text-paper/40">Drag the globe to look around</p>
    </div>
  );
}
