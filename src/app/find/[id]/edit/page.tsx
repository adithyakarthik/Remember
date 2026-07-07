import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/auth/session";
import { listFindHeadings } from "@/lib/finds";
import { updateFind } from "@/app/actions";
import { FindForm } from "@/app/FindForm";

export default async function EditFindPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireOnboardedUser();
  const { id } = await params;
  const { error } = await searchParams;

  const [find, headingOptions] = await Promise.all([
    prisma.find.findUnique({
      where: { id },
      include: { photos: { orderBy: { createdAt: "asc" } } },
    }),
    listFindHeadings(user.id),
  ]);
  if (!find || find.userId !== user.id) notFound();

  const updateThisFind = updateFind.bind(null, find.id);

  return (
    <div className="mx-auto max-w-lg">
      <Link href={`/find/${find.id}`} className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        ← Back to find
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Edit find</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {error}{" "}
          <Link href="/upgrade" className="font-medium underline">
            Upgrade
          </Link>
        </div>
      )}

      <div className="mt-6">
        <FindForm
          action={updateThisFind}
          headingOptions={headingOptions}
          defaultValues={{
            title: find.title,
            description: find.description ?? undefined,
            heading: find.heading,
            tags: find.tags,
            shopName: find.shopName ?? undefined,
            address: find.address ?? undefined,
            latitude: find.latitude,
            longitude: find.longitude,
          }}
          existingPhotos={find.photos.map((p) => ({ id: p.id, url: p.url }))}
          saveLabel="Save changes"
        />
      </div>
    </div>
  );
}
