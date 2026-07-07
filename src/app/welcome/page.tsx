import { requireUser } from "@/lib/auth/session";
import { saveProfile } from "./actions";
import { BRAND_GRADIENT } from "@/lib/brand";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { error } = await searchParams;

  const inputClass =
    "rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome 👋</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Tell us a little about you to finish setting up your account.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950">{error}</p>
      )}

      <form
        action={saveProfile}
        className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name *
          <input name="name" required defaultValue={user.name ?? ""} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Mobile number *
          <input
            name="mobile"
            type="tel"
            required
            defaultValue={user.mobile ?? ""}
            placeholder="+91 98450 27161"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          City *
          <input name="city" required defaultValue={user.city ?? ""} placeholder="Bengaluru" className={inputClass} />
        </label>

        <fieldset className="flex flex-col gap-1 text-sm font-medium">
          <span>Gender *</span>
          <div className="mt-1 flex gap-4 text-sm font-normal">
            {["male", "female", "other"].map((g) => (
              <label key={g} className="flex items-center gap-1 capitalize">
                <input type="radio" name="gender" value={g} defaultChecked={user.gender === g} required />
                {g}
              </label>
            ))}
          </div>
        </fieldset>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Your email is already verified. We use your mobile and city only for your account — never shared.
        </p>

        <button
          type="submit"
          className="mt-1 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105"
          style={{ backgroundImage: BRAND_GRADIENT }}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
