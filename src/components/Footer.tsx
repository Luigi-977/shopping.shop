export default function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between gap-6 text-sm text-wire">
        <div>
          <p className="font-display font-bold text-ink mb-1">
            REBOOT<span className="text-wire">/MARKET</span>
          </p>
          <p>Second-hand electronics, graded and warrantied.</p>
        </div>
        <div className="flex gap-10">
          <div>
            <p className="font-display text-xs uppercase text-ink mb-2">Shop</p>
            <ul className="space-y-1">
              <li>Phones</li>
              <li>Laptops</li>
              <li>Cameras</li>
            </ul>
          </div>
          <div>
            <p className="font-display text-xs uppercase text-ink mb-2">Sell</p>
            <ul className="space-y-1">
              <li>List a device</li>
              <li>Grading guide</li>
              <li>Payouts</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
