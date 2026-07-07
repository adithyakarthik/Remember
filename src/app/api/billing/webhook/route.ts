import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/billing";

const ACTIVATE = new Set(["subscription.activated", "subscription.charged", "subscription.resumed", "subscription.authenticated"]);
const DEACTIVATE = new Set(["subscription.cancelled", "subscription.completed", "subscription.halted", "subscription.expired"]);

// Razorpay subscription webhook. Flips a user's plan based on the subscription
// lifecycle. The subscription carries our userId in its `notes` (set when we
// created it), so we can map the event back to the account.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response("invalid signature", { status: 400 });
  }

  let event: { event?: string; payload?: { subscription?: { entity?: { notes?: { userId?: string } } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  const userId = event.payload?.subscription?.entity?.notes?.userId;
  const name = event.event ?? "";

  if (userId && (ACTIVATE.has(name) || DEACTIVATE.has(name))) {
    await prisma.user
      .update({
        where: { id: userId },
        data: { plan: ACTIVATE.has(name) ? "PRO" : "FREE", planUpdatedAt: new Date() },
      })
      .catch(() => {});
  }

  return new Response("ok");
}
