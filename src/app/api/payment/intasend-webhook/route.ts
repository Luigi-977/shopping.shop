import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";

// IntaSend calls this when a payment's state changes. We match the order via
// api_ref (which we set to our order id at checkout) and mark it paid on
// completion. Configure this URL in the IntaSend dashboard under Webhooks,
// and set INTASEND_WEBHOOK_CHALLENGE to the challenge value you choose there.
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  // IntaSend lets you set a "challenge" secret so you can trust the caller.
  const expected = process.env.INTASEND_WEBHOOK_CHALLENGE;
  if (expected && payload.challenge !== expected) {
    return NextResponse.json({ error: "Invalid challenge." }, { status: 401 });
  }

  // The order id we passed as api_ref comes back on the event.
  const apiRef = (payload.api_ref || payload.apiRef) as string | undefined;
  const state = (payload.state || payload.status) as string | undefined;

  if (apiRef && (state === "COMPLETE" || state === "PAID" || state === "SUCCESS")) {
    await markOrderPaid(apiRef);
  }

  // Always 200 so IntaSend doesn't keep retrying a handled event.
  return NextResponse.json({ received: true });
}
