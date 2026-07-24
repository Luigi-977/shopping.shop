"use client";

import { useState, useEffect, useRef } from "react";

export default function ImageCarousel({
  images,
  fallbackEmoji,
  alt,
}: {
  images: string[];
  fallbackEmoji: string;
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const hasImages = images.length > 0;
  const count = images.length;

  // Auto-play: advance every 3.5s, only when there's more than one image.
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 3500);
    return () => clearInterval(timer);
  }, [count]);

  function go(to: number) {
    setIndex(((to % count) + count) % count);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      go(dx < 0 ? index + 1 : index - 1);
    }
    touchStartX.current = null;
  }

  if (!hasImages) {
    return (
      <div className="aspect-square bg-ink/[0.03] rounded-lg flex items-center justify-center text-[8rem]">
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-ink/[0.03] rounded-lg overflow-hidden">
      {/* Sliding track: all images in a row, translated left/right. */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${alt} — photo ${i + 1}`}
            className="w-full h-full object-cover shrink-0"
          />
        ))}
      </div>

      {count > 1 && (
        <>
          {/* Prev / next arrows */}
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/80 text-ink flex items-center justify-center hover:bg-paper transition"
          >
            ‹
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-paper/80 text-ink flex items-center justify-center hover:bg-paper transition"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`w-2 h-2 rounded-full transition ${
                  i === index ? "bg-ink" : "bg-ink/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
