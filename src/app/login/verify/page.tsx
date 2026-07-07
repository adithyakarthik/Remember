import { resendOtp, verifyOtpAction } from "../actions";
import { Wordmark } from "@/components/Logo";
import { BRAND_GRADIENT } from "@/lib/brand";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const next = params.next ?? "/";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Wordmark className="text-2xl" />
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
          </p>
        </div>

        {params.devCode && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950">
            <strong>Dev mode — no email provider configured.</strong> Your code is{" "}
            <span className="font-mono text-base">{params.devCode}</span>. Set <code>RESEND_API_KEY</code> and{" "}
            <code>RESEND_FROM_EMAIL</code> to send real emails.
          </p>
        )}
        {params.notice && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950">{params.notice}</p>
        )}
        {params.error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950">{params.error}</p>
        )}

        <form
          action={verifyOtpAction}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1 text-sm font-medium">
            Login code
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-center text-lg tracking-widest dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105"
            style={{ backgroundImage: BRAND_GRADIENT }}
          >
            Verify &amp; sign in
          </button>
        </form>

        <form action={resendOtp} className="mt-3 text-center">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400">
            Resend code
          </button>
        </form>
      </div>
    </div>
  );
}
