import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth/session";
import { listFindHeadings } from "@/lib/finds";
import { createFind } from "@/app/actions";
import { FindForm } from "@/app/FindForm";

export default async function NewFindPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireOnboardedUser();
  const headingOptions = await listFindHeadings(user.id);
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        ← All finds
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">New find</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Snap a photo, tag the location, and file it under a heading so you can find it again later.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {error}{" "}
          <Link href="/upgrade" className="font-medium underline">
            Upgrade
          </Link>
        </div>
      )}

      <div className="mt-6">
        <FindForm action={createFind} headingOptions={headingOptions} saveLabel="Save find" />
      </div>
    </div>
  );
}
