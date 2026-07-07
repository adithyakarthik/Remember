import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth/session";
import { getUsage, FREE_MAX_FOLDERS, FREE_MAX_PHOTOS } from "@/lib/limits";
import { isBillingConfigured } from "@/lib/billing";
import { startCheckout } from "./actions";
import { BRAND_GRADIENT } from "@/lib/brand";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireOnboardedUser();
  const { status } = await searchParams;
  const usage = await getUsage(user.id);
  const billingLive = isBillingConfigured();
  const isPro = user.plan === "PRO";

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        ← All finds
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your plan</h1>

      {status === "unconfigured" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Payments aren&apos;t switched on yet — check back soon.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950">
          Something went wrong starting checkout. Please try again.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{isPro ? "Pro" : "Free"}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isPro
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {isPro ? "Active" : "Current plan"}
          </span>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Folders</dt>
            <dd>
              {usage.folders} {isPro ? "" : `/ ${FREE_MAX_FOLDERS}`}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500 dark:text-zinc-400">Photos</dt>
            <dd>
              {usage.photos} {isPro ? "" : `/ ${FREE_MAX_PHOTOS}`}
            </dd>
          </div>
        </dl>
      </div>

      {!isPro && (
        <div className="mt-6 rounded-xl border border-[#ffd3de] bg-[#fff2f5] p-6 dark:border-[#7a2540] dark:bg-[#2a0f19]">
          <h2 className="text-lg font-semibold">Upgrade to Pro</h2>
          <ul className="mt-3 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            <li>✓ Unlimited folders</li>
            <li>✓ Unlimited photos</li>
            <li>✓ Everything in Free</li>
          </ul>
          {billingLive ? (
            <form action={startCheckout} className="mt-4">
              <button
                type="submit"
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-105"
                style={{ backgroundImage: BRAND_GRADIENT }}
              >
                Subscribe monthly
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-lg bg-white/60 p-3 text-sm text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
              Paid plans are coming soon. You can keep using the free plan in the meantime.
            </p>
          )}
        </div>
      )}

      {isPro && (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          You&apos;re on Pro — thank you! Folders and photos are unlimited.
        </p>
      )}
    </div>
  );
}
