import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listFindHeadings } from "@/lib/finds";
import { createFind } from "@/app/actions";
import { FindForm } from "@/app/FindForm";

export default async function NewFindPage() {
  const user = await requireUser();
  const headingOptions = await listFindHeadings(user.id);

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        ← All finds
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">New find</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Snap a photo, tag the location, and file it under a heading so you can find it again later.
      </p>

      <div className="mt-6">
        <FindForm action={createFind} headingOptions={headingOptions} saveLabel="Save find" />
      </div>
    </div>
  );
}
