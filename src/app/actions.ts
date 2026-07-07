"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { saveUploadedPhoto } from "@/lib/storage";
import { assertWithinPlan, LimitError } from "@/lib/limits";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Extracts and validates the fields shared by create and update. Throws if a
// required field is missing. Note latitude/longitude are validated with
// Number.isNaN (not a falsy check) so the equator/prime-meridian value 0 is
// accepted.
function parseFindInput(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const heading = String(formData.get("heading") ?? "").trim();
  const latitude = parseFloat(String(formData.get("latitude") ?? ""));
  const longitude = parseFloat(String(formData.get("longitude") ?? ""));
  if (!title || !heading || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Title, heading and location are required");
  }
  return {
    title,
    heading,
    latitude,
    longitude,
    description: String(formData.get("description") ?? "").trim() || null,
    tags: parseTags(String(formData.get("tags") ?? "")),
    shopName: String(formData.get("shopName") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
  };
}

function getPhotoFiles(formData: FormData): File[] {
  return formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
}

export async function createFind(formData: FormData) {
  const user = await requireUser();

  const input = parseFindInput(formData);
  const files = getPhotoFiles(formData);

  // Enforce the free-plan caps before uploading anything.
  try {
    await assertWithinPlan({ userId: user.id, plan: user.plan, heading: input.heading, newPhotoCount: files.length });
  } catch (err) {
    if (err instanceof LimitError) redirect(`/new?error=${encodeURIComponent(err.message)}`);
    throw err;
  }

  const photoUrls = await Promise.all(files.map((file) => saveUploadedPhoto(file)));

  const find = await prisma.find.create({
    data: {
      userId: user.id,
      ...input,
      photos: { create: photoUrls.map((url) => ({ url })) },
    },
  });

  revalidatePath("/");
  redirect(`/find/${find.id}`);
}

export async function updateFind(findId: string, formData: FormData) {
  const user = await requireUser();
  const find = await prisma.find.findUnique({ where: { id: findId } });
  if (!find || find.userId !== user.id) notFound();

  const input = parseFindInput(formData);
  const removePhotoIds = formData.getAll("removePhotoIds").map(String);
  const files = getPhotoFiles(formData);

  try {
    await assertWithinPlan({
      userId: user.id,
      plan: user.plan,
      heading: input.heading,
      newPhotoCount: files.length,
      photosBeingReplaced: removePhotoIds.length,
    });
  } catch (err) {
    if (err instanceof LimitError) redirect(`/find/${findId}/edit?error=${encodeURIComponent(err.message)}`);
    throw err;
  }

  const photoUrls = await Promise.all(files.map((file) => saveUploadedPhoto(file)));

  await prisma.find.update({
    where: { id: findId },
    data: {
      ...input,
      photos: {
        deleteMany: removePhotoIds.length > 0 ? { id: { in: removePhotoIds } } : undefined,
        create: photoUrls.map((url) => ({ url })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/find/${findId}`);
  redirect(`/find/${findId}`);
}

export async function deleteFind(findId: string) {
  const user = await requireUser();
  const find = await prisma.find.findUnique({ where: { id: findId } });
  if (!find || find.userId !== user.id) notFound();

  await prisma.find.delete({ where: { id: findId } });
  revalidatePath("/");
  redirect("/");
}
