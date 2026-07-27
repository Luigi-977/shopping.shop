"use client";

import { useState } from "react";
import { MapPin, Clock, AlertTriangle, Store, Plane } from "lucide-react";
import { COUNTRIES, HUBS, estimateDelivery, type DeliveryEstimate } from "@/lib/delivery";
import ShippingMap from "@/components/ShippingMap";

const REGIONS: DeliveryEstimate["region"][] = ["Africa", "Europe", "Americas", "Asia", "Oceania"];

export default function DeliveryEstimator() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<DeliveryEstimate | null>(null);

  function check(newCode: string) {
    setCode(newCode);
    if (!newCode) {
      setResult(null);
      return;
    }
    setResult(estimateDelivery(newCode));
  }

  return (
    <div className="mt-6 border-t border-ink/10 pt-6">
      <h2 className="font-display text-xs uppercase tracking-wide text-wire mb-3 flex items-center gap-1.5">
        <MapPin size={14} className="text-circuit" />
        Delivery estimate
        <span className="ml-auto normal-case tracking-normal font-medium text-[11px] text-circuit bg-circuit-soft rounded-full px-2 py-0.5 flex items-center gap-1">
          <Plane size={11} />
          Shipped by air
        </span>
      </h2>

      <select
        value={code}
        onChange={(e) => check(e.target.value)}
        className="w-full border border-ink/20 rounded-md px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-circuit"
      >
        <option value="">Select your country…</option>
        {REGIONS.map((region) => (
          <optgroup key={region} label={region}>
            {COUNTRIES.filter((c) => c.region === region).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {result && (
        <div className="mt-4 space-y-3">
          {result.doorstep ? (
            <div className="flex items-start gap-2 bg-circuit-soft/60 border border-circuit/20 rounded-md px-4 py-3">
              <Clock size={16} className="text-circuit mt-0.5 shrink-0" />
              <p className="text-sm text-ink">
                Flown to your door by <span className="font-semibold">air freight</span> in{" "}
                <span className="font-semibold">
                  {result.etaDaysLow}–{result.etaDaysHigh} working days
                </span>{" "}
                from our {HUBS.shenzhen.name} supply hub — no slow sea shipping. Exact timing depends on{" "}
                {result.country.name} and how early in the day you order: orders placed before 2pm
                (Nairobi time) on a working day ship the same day.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-signal/10 border border-signal/40 rounded-md px-4 py-3">
              <AlertTriangle size={16} className="text-signal mt-0.5 shrink-0" />
              <p className="text-sm text-ink">
                Direct doorstep delivery isn&rsquo;t available in {result.country.name} yet. Your order
                still travels by air, not sea, and will be routed to our nearest{" "}
                {result.region === "Africa" ? "shop" : "regional hub"} —{" "}
                <span className="font-semibold inline-flex items-center gap-1">
                  <Store size={13} className="text-circuit" />
                  {result.redirectHub?.name}
                </span>{" "}
                — for pickup, up to a maximum of{" "}
                <span className="font-semibold">
                  {result.etaDaysLow}–{result.etaDaysHigh} working days
                </span>
                .
              </p>
            </div>
          )}

          <ShippingMap
            origin={HUBS.shenzhen}
            destination={result.country}
            waypoint={result.redirectHub}
            etaLabel={`${result.etaDaysLow}–${result.etaDaysHigh} working days`}
          />

          <a href="/how-it-works" className="text-xs text-circuit hover:underline inline-block">
            How our delivery & pickup process works →
          </a>
        </div>
      )}
    </div>
  );
}
