import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies — Reboot Market",
  description:
    "Our returns, warranty, shipping, and privacy policies for buying refurbished and second-hand electronics.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-medium mb-3">{title}</h2>
      <div className="space-y-3 text-ink/80 leading-relaxed text-sm">{children}</div>
    </section>
  );
}

export default function PoliciesPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="font-display text-xs uppercase tracking-widest text-circuit mb-4">
        The fine print
      </p>
      <h1 className="text-3xl font-medium mb-4">Our policies</h1>
      <p className="text-wire mb-8 text-sm">
        Straightforward terms so you know exactly where you stand. Questions?
        Reach us any time via the contact page.
      </p>

      {/* Quick jump links */}
      <nav className="flex flex-wrap gap-2 mb-10">
        {[
          ["returns", "Returns"],
          ["warranty", "Warranty"],
          ["shipping", "Shipping"],
          ["privacy", "Privacy"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-xs font-display px-3 py-1.5 rounded-full border border-ink/20 hover:border-ink/50 transition-colors"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        <Section id="returns" title="Returns & refunds">
          <p>
            If a device arrives and isn&rsquo;t as described by its grade, you
            can return it within <strong>14 days</strong> of delivery for a full
            refund or replacement. The item must be in the same condition you
            received it, with any included accessories.
          </p>
          <p>
            To start a return, contact us with your order number and a short
            description of the issue. We&rsquo;ll guide you through the next
            steps. Refunds are processed once we receive and inspect the
            returned item.
          </p>
        </Section>

        <Section id="warranty" title="Warranty">
          <p>
            Every device is covered by a warranty of between{" "}
            <strong>60 and 180 days</strong>, shown on each product page. The
            warranty covers hardware faults that arise through normal use — it
            does not cover accidental damage, liquid damage, or issues caused by
            unauthorised repairs.
          </p>
          <p>
            If a covered fault appears within the warranty period, we&rsquo;ll
            repair, replace, or refund the device at our discretion.
          </p>
        </Section>

        <Section id="shipping" title="Shipping & delivery">
          <p>
            We ship across the region and internationally. Delivery times and
            costs depend on your location and are confirmed at checkout or when
            you contact us about a specific item.
          </p>
          <p>
            Once your order ships, we&rsquo;ll share tracking details where
            available. If you need a delivery estimate for your country before
            ordering, message us and we&rsquo;ll let you know.
          </p>
        </Section>

        <Section id="privacy" title="Privacy">
          <p>
            We collect only the information needed to process your orders and
            support you — such as your name, email, and delivery details. We
            never sell your data.
          </p>
          <p>
            Payment is handled by our payment provider; we don&rsquo;t store
            your full card or mobile-money details on our servers. You can ask
            us to update or delete your account information at any time.
          </p>
        </Section>
      </div>

      <p className="text-xs text-wire mt-12 border-t border-ink/10 pt-6">
        These policies are provided in good faith and may be updated. They
        don&rsquo;t override any rights you have under applicable consumer
        protection law.
      </p>
    </div>
  );
}
