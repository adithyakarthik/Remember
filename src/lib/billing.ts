import { createHmac, timingSafeEqual } from "crypto";

// Razorpay subscription helpers — no SDK, just their REST API. Billing is
// optional: the upgrade button only goes live when these env vars are set,
// otherwise the /upgrade page shows a "coming soon" state.
//
// Setup (see README): create a Razorpay account, make a monthly Subscription
// Plan, and set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_ID and
// RAZORPAY_WEBHOOK_SECRET.

export function isBillingConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_PLAN_ID);
}

export function razorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID;
}

function authHeader(): string {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

export interface SubscriptionHandle {
  id: string;
  shortUrl: string | null;
}

/**
 * Creates a Razorpay subscription against the configured monthly plan, tagging
 * it with our userId so the webhook can map a payment back to the account.
 */
export async function createSubscription(userId: string, email: string): Promise<SubscriptionHandle> {
  const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: 120, // up to 10 years of monthly cycles
      customer_notify: 1,
      notes: { userId, email },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Razorpay subscription create failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { id: string; short_url?: string };
  return { id: data.id, shortUrl: data.short_url ?? null };
}

/** Verifies a Razorpay webhook signature against RAZORPAY_WEBHOOK_SECRET. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
