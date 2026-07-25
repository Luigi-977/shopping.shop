import type { Metadata } from "next";
import { CONTACT, whatsappLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact — Reboot Market",
  description:
    "Get in touch with Reboot Market. WhatsApp, phone, and email, plus our London office and Shenzhen supplier locations.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="font-display text-xs uppercase tracking-widest text-circuit mb-4">
        Contact
      </p>
      <h1 className="text-3xl font-medium mb-4">Get in touch</h1>
      <p className="text-wire mb-8 text-sm">
        Questions about an item, delivery to your country, or an existing order?
        We&rsquo;re happy to help — reach us whichever way suits you.
      </p>

      {/* Contact methods */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <a
          href={whatsappLink("Hi Reboot Market, I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-ink/10 rounded-lg p-5 hover:border-ink/30 transition-colors"
        >
          <p className="font-display text-xs uppercase text-wire mb-1">WhatsApp</p>
          <p className="font-medium text-[#128C4A]">Chat with us</p>
          <p className="text-sm text-wire mt-1">{CONTACT.phone}</p>
        </a>
        <a
          href={`tel:${CONTACT.phone}`}
          className="border border-ink/10 rounded-lg p-5 hover:border-ink/30 transition-colors"
        >
          <p className="font-display text-xs uppercase text-wire mb-1">Phone</p>
          <p className="font-medium">Call us</p>
          <p className="text-sm text-wire mt-1">{CONTACT.phone}</p>
        </a>
        <a
          href="mailto:hello@reboot.market"
          className="border border-ink/10 rounded-lg p-5 hover:border-ink/30 transition-colors"
        >
          <p className="font-display text-xs uppercase text-wire mb-1">Email</p>
          <p className="font-medium">Message us</p>
          <p className="text-sm text-wire mt-1 break-all">hello@reboot.market</p>
        </a>
      </div>

      {/* Offices with maps */}
      <h2 className="text-xl font-medium mb-6">Our offices</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-display text-sm mb-1">London, United Kingdom</p>
          <p className="text-sm text-wire mb-3">Head office &amp; sales</p>
          <div className="rounded-lg overflow-hidden border border-ink/10 aspect-[4/3]">
            <iframe
              title="London office map"
              src="https://www.google.com/maps?q=London,UK&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div>
          <p className="font-display text-sm mb-1">Shenzhen, China</p>
          <p className="text-sm text-wire mb-3">Supplier &amp; sourcing</p>
          <div className="rounded-lg overflow-hidden border border-ink/10 aspect-[4/3]">
            <iframe
              title="Shenzhen supplier map"
              src="https://www.google.com/maps?q=Shenzhen,China&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
