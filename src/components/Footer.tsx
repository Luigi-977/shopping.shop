import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between gap-8 text-sm text-wire">
        <div className="max-w-xs">
          <p className="font-display font-bold text-ink mb-1">
            REBOOT<span className="text-wire">/MARKET</span>
          </p>
          <p>Second-hand electronics, graded and warrantied.</p>
        </div>
        <div className="flex flex-wrap gap-10">
          <div>
            <p className="font-display text-xs uppercase text-ink mb-2">Shop</p>
            <ul className="space-y-1">
              <li>
                <Link href="/shop" className="hover:text-circuit transition-colors">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-circuit transition-colors">
                  Sell a device
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs uppercase text-ink mb-2">Company</p>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="hover:text-circuit transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-circuit transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-circuit transition-colors">
                  Policies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
