import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth/session";
import { FindCard } from "@/components/FindCard";
import { folderGradient } from "@/lib/palette";
import { BRAND_GRADIENT } from "@/lib/brand";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireOnboardedUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your finds</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            You find it, just tag it — organised into folders.
          </p>
        </div>
        <Link
          href="/new"
          className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105"
          style={{ backgroundImage: BRAND_GRADIENT }}
        >
          + New find
        </Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search everything — title, tags, shop, address…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      {query ? <SearchResults userId={user.id} query={query} /> : <Folders userId={user.id} />}
    </div>
  );
}

// Default view: one folder tile per heading, with a cover photo and a count.
async function Folders({ userId }: { userId: string }) {
  const finds = await prisma.find.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  if (finds.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        No finds yet — tag the next shop or item you spot and want to remember.
      </p>
    );
  }

  const folders = new Map<string, { count: number; cover?: string }>();
  for (const find of finds) {
    const entry = folders.get(find.heading) ?? { count: 0 };
    entry.count += 1;
    if (!entry.cover && find.photos[0]) entry.cover = find.photos[0].url;
    folders.set(find.heading, entry);
  }
  const folderList = [...folders.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {folderList.map(([heading, { count, cover }]) => (
        <Link
          key={heading}
          href={`/folder/${encodeURIComponent(heading)}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div
            className="flex h-28 w-full items-center justify-center"
            style={cover ? undefined : { backgroundImage: folderGradient(heading) }}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl drop-shadow-sm">🏷️</span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 p-3">
            <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{heading}</span>
            <span
              className="w-fit rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
              style={{ backgroundImage: folderGradient(heading) }}
            >
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Search view: flat list of matching finds across all folders.
async function SearchResults({ userId, query }: { userId: string; query: string }) {
  const finds = await prisma.find.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { heading: { contains: query, mode: "insensitive" } },
        { shopName: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { photos: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {finds.length} {finds.length === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
        </p>
        <Link href="/" className="text-sm font-medium text-[#e23670] hover:underline dark:text-[#ff7a9c]">
          ← Back to folders
        </Link>
      </div>
      {finds.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          Nothing matched. Try a different word.
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
