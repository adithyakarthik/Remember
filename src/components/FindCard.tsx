import Link from "next/link";

export type FindCardData = {
  id: string;
  title: string;
  heading: string;
  shopName: string | null;
  address: string | null;
  tags: string[];
  photos: { url: string }[];
};

// A single find shown as a card (photo thumbnail + heading + title + tags).
// Reused by the folder view and search results.
export function FindCard({ find }: { find: FindCardData }) {
  return (
    <Link
      href={`/find/${find.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="h-40 w-full bg-zinc-100 dark:bg-zinc-800">
        {find.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={find.photos[0].url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">No photo</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
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
  );
}
