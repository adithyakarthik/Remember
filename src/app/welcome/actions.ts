"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

const GENDERS = ["male", "female", "other"];

export async function saveProfile(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim().toLowerCase();

  if (!name || !mobile || !city || !GENDERS.includes(gender)) {
    redirect(`/welcome?error=${encodeURIComponent("Please fill in every field.")}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, mobile, city, gender },
  });

  redirect("/");
}
