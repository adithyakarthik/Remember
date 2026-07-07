import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_DAYS = 30;

export type Plan = "FREE" | "PRO";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  mobile: string | null;
  city: string | null;
  gender: string | null;
  plan: Plan;
}

/** A profile is "complete" once all onboarding fields are filled in. */
export function isProfileComplete(user: CurrentUser): boolean {
  return Boolean(user.name && user.mobile && user.city && user.gender);
}

/**
 * Finds or creates the User row for an email that just authenticated (email
 * OTP or Google). `defaults` lets Google prefill the name on first sign-in.
 */
export async function findOrCreateUser(email: string, defaults?: { name?: string | null }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return existing;

  return prisma.user.create({
    data: { email: normalizedEmail, name: defaults?.name?.trim() || null },
  });
}

export async function createSession(userId: string) {
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    mobile: u.mobile,
    city: u.city,
    gender: u.gender,
    plan: u.plan === "PRO" ? "PRO" : "FREE",
  };
}

/** For use at the top of any protected server component or server action. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Like requireUser, but also sends users who haven't finished onboarding to
 * /welcome. Use on the main app pages; /welcome itself uses requireUser.
 */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!isProfileComplete(user)) {
    redirect("/welcome");
  }
  return user;
}
