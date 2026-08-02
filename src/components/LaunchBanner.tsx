import Link from "next/link";

// A prominent launch-week strip at the very top of the home page. It states the
// offer, reinforces trust signals (warranty, tested, delivery, payment), and
// pushes visitors from social straight into the shop.
export default function LaunchBanner() {
  return (
    <div className="bg-ink text-paper">
      <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <p className="font-display font-extrabold text-sm sm:text-base tracking-tight">
            🚀 LAUNCH WEEK — Free delivery on every order
          </p>
          <p className="text-paper/70 text-xs mt-0.5">
            Graded &amp; warrantied phones, laptops &amp; more · M-Pesa &amp; card · Worldwide delivery
          </p>
        </div>
        <Link
          href="/shop"
          className="shrink-0 bg-signal text-ink font-display font-bold text-sm px-5 py-2.5 rounded-md hover:brightness-95 transition"
        >
          Shop the deals →
        </Link>
      </div>
    </div>
  );
}
