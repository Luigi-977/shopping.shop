import { Resend } from "resend";

// Emails only send when RESEND_API_KEY is configured. Until then, these
// functions no-op (and log), so the site works fine without email set up.
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

// The "from" address. Until you verify your own domain in Resend, their
// shared onboarding sender works for testing.
const FROM = process.env.EMAIL_FROM || "Reboot Market <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = client();
  if (!resend) {
    console.log(`[email skipped — no RESEND_API_KEY] to=${opts.to} subject=${opts.subject}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

function shell(title: string, body: string) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #14181c;">
    <div style="padding: 20px 0; border-bottom: 2px solid #ffb000;">
      <span style="font-weight: bold; font-size: 18px;">REBOOT<span style="color:#6b7280;">/MARKET</span></span>
    </div>
    <div style="padding: 24px 0;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${body}
    </div>
    <div style="padding: 20px 0; border-top: 1px solid #e2ddd0; font-size: 12px; color: #6b7280;">
      Reboot Market — second-hand electronics, graded and warrantied.
    </div>
  </div>`;
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  await sendEmail({
    to,
    subject: "Welcome to Reboot Market",
    html: shell(
      "Welcome aboard 👋",
      `<p>${greeting}</p>
       <p>Thanks for creating an account with Reboot Market. You can now
       check out faster, track your orders, and get help whenever you need it.</p>
       <p>Every device we sell is graded and warrantied — so you always know
       exactly what you're getting.</p>
       <p style="margin-top:20px;">Happy browsing!</p>`
    ),
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderId: string,
  itemsSummary: string,
  total: string
) {
  await sendEmail({
    to,
    subject: `Your order #${orderId.slice(-8)} is confirmed`,
    html: shell(
      "Payment received — your order is being prepared 📦",
      `<p>Thank you! We've received your payment and your order is now being
       prepared for shipment.</p>
       <p style="margin:16px 0; padding:16px; background:#edeae2; border-radius:8px;">
         <strong>Order #${orderId.slice(-8)}</strong><br/>
         ${itemsSummary}<br/>
         <strong>Total paid: ${total}</strong>
       </p>
       <p>We'll be in touch with shipping details. If you have any questions,
       just reply to this email or contact us on WhatsApp.</p>`
    ),
  });
}
