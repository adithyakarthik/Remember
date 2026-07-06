import { requestOtp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold tracking-tight">📍 Remember</div>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in with your email — no password needed.
          </p>
        </div>

        {params.error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950">{params.error}</p>
        )}

        <form
          action={requestOtp}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email address
            <input
              name="email"
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Send login code
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          We&apos;ll email you a 6-digit code. It expires in 10 minutes.
        </p>
      </div>
    </div>
  );
}
