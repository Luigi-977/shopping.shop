// Delivery estimation: distance-based ETA from our supply hubs, plus the
// list of countries we cannot yet courier direct to a customer's door.

export type Country = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  region: "Africa" | "Americas" | "Europe" | "Asia" | "Oceania";
};

// Capital-city coordinates, used as a stand-in for "customer location" per country.
export const COUNTRIES: Country[] = [
  { code: "KE", name: "Kenya", lat: -1.2864, lon: 36.8172, region: "Africa" },
  { code: "TZ", name: "Tanzania", lat: -6.1630, lon: 35.7516, region: "Africa" },
  { code: "UG", name: "Uganda", lat: 0.3476, lon: 32.5825, region: "Africa" },
  { code: "RW", name: "Rwanda", lat: -1.9403, lon: 29.8739, region: "Africa" },
  { code: "ET", name: "Ethiopia", lat: 9.0250, lon: 38.7469, region: "Africa" },
  { code: "NG", name: "Nigeria", lat: 9.0765, lon: 7.3986, region: "Africa" },
  { code: "GH", name: "Ghana", lat: 5.6037, lon: -0.1870, region: "Africa" },
  { code: "ZA", name: "South Africa", lat: -25.7479, lon: 28.2293, region: "Africa" },
  { code: "EG", name: "Egypt", lat: 30.0444, lon: 31.2357, region: "Africa" },
  { code: "ZM", name: "Zambia", lat: -15.3875, lon: 28.3228, region: "Africa" },
  { code: "MW", name: "Malawi", lat: -13.9626, lon: 33.7741, region: "Africa" },
  { code: "SO", name: "Somalia", lat: 2.0469, lon: 45.3182, region: "Africa" },
  { code: "GB", name: "United Kingdom", lat: 51.5072, lon: -0.1276, region: "Europe" },
  { code: "DE", name: "Germany", lat: 52.5200, lon: 13.4050, region: "Europe" },
  { code: "FR", name: "France", lat: 48.8566, lon: 2.3522, region: "Europe" },
  { code: "TR", name: "Turkey", lat: 39.9334, lon: 32.8597, region: "Europe" },
  { code: "US", name: "United States", lat: 38.9072, lon: -77.0369, region: "Americas" },
  { code: "CA", name: "Canada", lat: 45.4215, lon: -75.6972, region: "Americas" },
  { code: "MX", name: "Mexico", lat: 19.4326, lon: -99.1332, region: "Americas" },
  { code: "BR", name: "Brazil", lat: -15.8267, lon: -47.9218, region: "Americas" },
  { code: "AE", name: "United Arab Emirates", lat: 24.4539, lon: 54.3773, region: "Asia" },
  { code: "IN", name: "India", lat: 28.6139, lon: 77.2090, region: "Asia" },
  { code: "CN", name: "China", lat: 22.5431, lon: 114.0579, region: "Asia" },
  { code: "AU", name: "Australia", lat: -35.2809, lon: 149.1300, region: "Oceania" },
];

// Fulfillment hubs. Shenzhen is where refurb stock ships from; Nairobi and
// London are the two customer-facing dispatch points.
export const HUBS = {
  shenzhen: { name: "Shenzhen, China", lat: 22.5431, lon: 114.0579 },
  nairobi: { name: "Nairobi, Kenya", lat: -1.2864, lon: 36.8172 },
  london: { name: "London, UK", lat: 51.5072, lon: -0.1276 },
};

// Countries we cannot yet courier directly to a customer's address.
// Orders here are routed to the nearest Reboot Market shop/hub instead.
export const NO_DOORSTEP_DELIVERY = new Set(["CA", "TR", "TZ", "UG"]);

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type DeliveryEstimate = {
  country: Country;
  doorstep: boolean;
  distanceKm: number;
  etaDaysLow: number;
  etaDaysHigh: number;
  hub: { name: string; lat: number; lon: number };
  redirectHub?: { name: string; lat: number; lon: number };
  region: Country["region"];
};

export function estimateDelivery(code: string): DeliveryEstimate | null {
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) return null;

  // Every order originates from the Shenzhen supply hub.
  const distanceKm = Math.round(haversineKm(HUBS.shenzhen, country));

  // Rough courier-speed model: ~700km/day equivalent once air freight +
  // customs + last-mile are folded in, with a floor/ceiling for realism.
  const base = Math.max(2, Math.round(distanceKm / 900));
  const etaDaysLow = base + (country.region === "Africa" ? 1 : 2);
  const etaDaysHigh = etaDaysLow + 3;

  const doorstep = !NO_DOORSTEP_DELIVERY.has(code);

  return {
    country,
    doorstep,
    distanceKm,
    etaDaysLow,
    etaDaysHigh,
    hub: HUBS.shenzhen,
    redirectHub: doorstep ? undefined : country.region === "Africa" ? HUBS.nairobi : HUBS.london,
    region: country.region,
  };
}
