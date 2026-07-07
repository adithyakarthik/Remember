"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { isBillingConfigured, createSubscription } from "@/lib/billing";

// Creates a Razorpay subscription and sends the user to Razorpay's hosted
// payment page. The account is upgraded to PRO by the webhook once payment
// succeeds — no client-side Razorpay script needed.
export async function startCheckout() {
  const user = await requireUser();

  if (!isBillingConfigured()) {
    redirect("/upgrade?status=unconfigured");
  }

  let shortUrl: string | null = null;
  try {
    const sub = await createSubscription(user.id, user.email);
    shortUrl = sub.shortUrl;
  } catch {
    redirect("/upgrade?status=error");
  }

  if (!shortUrl) redirect("/upgrade?status=error");
  redirect(shortUrl);
}
