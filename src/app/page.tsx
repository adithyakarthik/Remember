import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { listFindHeadings } from "@/lib/finds";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; heading?: string }>;
}) {
  const user = await requireUser();
  const { q, heading } = await searchParams;

  const query = (q ?? "").trim();
  const [allHeadings, finds] = await Promise.all([
    listFindHeadings(user.id),
    prisma.find.findMany({
      where: {
        userId: user.id,
        ...(heading ? { heading } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { heading: { contains: query, mode: "insensitive" } },
                { shopName: { contains: query, mode: "insensitive" } },
                { address: { contains: query, mode: "insensitive" } },
                { tags: { has: query } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { photos: { take: 1, orderBy: { createdAt: "asc" } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your finds</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Shops and items you&apos;ve spotted, geo-tagged so you can find your way back.
          </p>
        </div>
        <Link
          href="/new"
          className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          + New find
        </Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, tags, shop, address…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <select
          name="heading"
          defaultValue={heading ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="">All</option>
          {allHeadings.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      {finds.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No finds yet — tag the next shop or item you spot and want to remember.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {finds.map((find) => (
            <Link
              key={find.id}
              href={`/find/${find.id}`}
              className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
                {find.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={find.photos[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">No photos</div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <span className="w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                  {find.heading}
                </span>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{find.title}</h2>
                {find.shopName && <p className="text-sm text-zinc-600 dark:text-zinc-400">{find.shopName}</p>}
                {find.address && <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">{find.address}</p>}
                {find.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {find.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
