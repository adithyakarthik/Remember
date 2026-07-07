import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth/session";
import { FindCard } from "@/components/FindCard";

export default async function FolderPage({ params }: { params: Promise<{ heading: string }> }) {
  const user = await requireOnboardedUser();
  const { heading: raw } = await params;
  const heading = decodeURIComponent(raw);

  const finds = await prisma.find.findMany({
    where: { userId: user.id, heading },
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← All folders
        </Link>
        <div className="mt-1 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">📁 {heading}</h1>
          <Link
            href="/new"
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            + New find
          </Link>
        </div>
      </div>

      {finds.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          This folder is empty.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {finds.map((find) => (
            <FindCard key={find.id} find={find} />
          ))}
        </div>
      )}
    </div>
  );
}
