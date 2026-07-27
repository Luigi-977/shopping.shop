import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Tv,
  Speaker,
  Refrigerator,
  Tablet,
  Camera,
  Gamepad2,
  Monitor,
  LayoutGrid,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Smartphone> = {
  Phones: Smartphone,
  Laptops: Laptop,
  TVs: Tv,
  "Sound Systems": Speaker,
  Fridges: Refrigerator,
  Tablets: Tablet,
  Cameras: Camera,
  Gaming: Gamepad2,
  Monitors: Monitor,
};

// Bold, alternating tile colors so the strip reads as a marketplace
// category rail rather than a flat list.
const TILE_COLORS = ["bg-flash", "bg-circuit", "bg-ink", "bg-rust"];

export default function CategoryStrip({ categories }: { categories: string[] }) {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-5 px-5">
      <div className="flex gap-4 w-max pb-1">
        <Link href="/shop" className="flex flex-col items-center gap-1.5 w-16 shrink-0">
          <span className="w-14 h-14 rounded-2xl bg-signal flex items-center justify-center text-ink shadow-sm">
            <LayoutGrid size={22} />
          </span>
          <span className="text-[11px] font-display text-ink text-center leading-tight">All</span>
        </Link>
        {categories.map((c, i) => {
          const Icon = CATEGORY_ICONS[c] ?? LayoutGrid;
          const color = TILE_COLORS[i % TILE_COLORS.length];
          return (
            <Link
              key={c}
              href={`/shop?category=${encodeURIComponent(c)}`}
              className="flex flex-col items-center gap-1.5 w-16 shrink-0"
            >
              <span className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-paper shadow-sm`}>
                <Icon size={22} />
              </span>
              <span className="text-[11px] font-display text-ink text-center leading-tight">{c}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
