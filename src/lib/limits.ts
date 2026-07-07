import { prisma } from "@/lib/db";
import type { Plan } from "@/lib/auth/session";
import { BILLING_ENABLED } from "@/lib/features";

// Free plan caps. PRO (active Razorpay subscription) removes them.
export const FREE_MAX_FOLDERS = 1;
export const FREE_MAX_PHOTOS = 10;

export interface Usage {
  folders: number; // distinct headings
  photos: number; // total FindPhoto rows
}

export async function getUsage(userId: string): Promise<Usage> {
  const [headings, photos] = await Promise.all([
    prisma.find.findMany({ where: { userId }, select: { heading: true }, distinct: ["heading"] }),
    prisma.findPhoto.count({ where: { find: { userId } } }),
  ]);
  return { folders: headings.length, photos };
}

export class LimitError extends Error {}

/**
 * Throws a LimitError if saving a find with `heading` and `newPhotoCount` new
 * photos would exceed the free plan. PRO users are never limited. `existingHeadings`
 * is the set of headings the user already uses (so reusing a folder is free);
 * `photosBeingReplaced` is how many existing photos this save removes (edit flow).
 */
export async function assertWithinPlan(params: {
  userId: string;
  plan: Plan;
  heading: string;
  newPhotoCount: number;
  photosBeingReplaced?: number;
}): Promise<void> {
  // Billing is off — everything is free and unlimited for everyone.
  if (!BILLING_ENABLED) return;
  if (params.plan === "PRO") return;

  const usage = await getUsage(params.userId);

  const existingHeadings = await prisma.find.findMany({
    where: { userId: params.userId },
    select: { heading: true },
    distinct: ["heading"],
  });
  const headingSet = new Set(existingHeadings.map((h) => h.heading));
  const isNewFolder = !headingSet.has(params.heading);

  if (isNewFolder && usage.folders >= FREE_MAX_FOLDERS) {
    throw new LimitError(
      `The free plan allows ${FREE_MAX_FOLDERS} folder. Reuse "${[...headingSet][0]}" or upgrade to add more folders.`,
    );
  }

  const projectedPhotos = usage.photos - (params.photosBeingReplaced ?? 0) + params.newPhotoCount;
  if (projectedPhotos > FREE_MAX_PHOTOS) {
    throw new LimitError(
      `The free plan allows ${FREE_MAX_PHOTOS} photos total (you have ${usage.photos}). Upgrade to add more.`,
    );
  }
}
