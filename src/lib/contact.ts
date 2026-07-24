// Business contact details. Update the number here and it changes everywhere.
export const CONTACT = {
  // International format, digits only (no +, spaces, or dashes) for wa.me / tel links.
  whatsapp: "447446361765",
  phone: "+447446361765",
};

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
