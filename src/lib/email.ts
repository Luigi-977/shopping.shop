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
    const result = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (result.error) {
      console.error(
        `[email FAILED] to=${opts.to} reason=${result.error.message} — ` +
          `on Resend's shared test sender, delivery only works to your own Resend signup email. ` +
          `Verify a domain in Resend to send to real customers.`
      );
    }
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
  total: string,
  customerName?: string | null
) {
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";
  await sendEmail({
    to,
    subject: `Your order #${orderId.slice(-8)} — please confirm your delivery details`,
    html: shell(
      "Thank you for your order! 🎉",
      `<p>${greeting}</p>
       <p>Welcome, and thank you for shopping with Reboot Market! We've
       received your payment and your order is now <strong>wait-listed for
       delivery</strong>.</p>
       <p style="margin:16px 0; padding:16px; background:#edeae2; border-radius:8px;">
         <strong>Order #${orderId.slice(-8)}</strong><br/>
         ${itemsSummary}<br/>
         <strong>Total paid: ${total}</strong>
       </p>
       <p style="padding:16px; background:#fff6e0; border-radius:8px; border:1px solid #ffb000;">
         <strong>📦 Action needed — send us your delivery details</strong><br/>
         To get your order out to you as fast as possible, please reply to this
         email (or message us on WhatsApp) with:
       </p>
       <ul style="color:#1f262c; font-size:14px; line-height:1.7;">
         <li>Your full name</li>
         <li>Phone number</li>
         <li>Delivery address / area</li>
         <li>Any landmark or delivery notes</li>
       </ul>
       <p>As soon as we have your details, we'll confirm your delivery window
       and get your device on its way. Most local deliveries go out within a
       day.</p>
       <p style="margin-top:20px;">Thank you for trusting us — we can't wait to
       get your device to you!</p>`
    ),
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shopping-shop-ashy.vercel.app";

export async function sendReviewRequestEmail(
  to: string,
  orderId: string,
  items: { name: string; slug: string }[],
  customerName?: string | null
) {
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";
  const links = items
    .map(
      (i) =>
        `<li><a href="${SITE_URL}/product/${i.slug}" style="color:#3c7a5f;">${i.name}</a></li>`
    )
    .join("");

  await sendEmail({
    to,
    subject: "How's your device? Leave a quick review",
    html: shell(
      "How's it going so far?",
      `<p>${greeting}</p>
       <p>It's been a few days since your order (#${orderId.slice(-8)}) arrived, and
       we'd love to know what you think — good or honest-and-not-so-good, either
       one helps other buyers make a better decision.</p>
       <p>Takes under a minute:</p>
       <ul style="color:#1f262c; font-size:14px; line-height:1.7;">
         ${links}
       </ul>
       <p style="margin-top:20px;">Thanks for shopping with us!</p>`
    ),
  });
}
