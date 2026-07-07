import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exchangeCodeForProfile, isGoogleConfigured } from "@/lib/auth/google";
import { findOrCreateUser, createSession } from "@/lib/auth/session";

const STATE_COOKIE = "g_oauth_state";

// Handles Google's redirect back: validates state, exchanges the code for the
// profile, then signs the user in (creating the account on first sign-in).
export async function GET(request: NextRequest) {
  const loginError = (msg: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, request.url));

  if (!isGoogleConfigured()) return loginError("Google sign-in is not configured");

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError("Google sign-in failed — please try again.");
  }

  const profile = await exchangeCodeForProfile(code, url.origin);
  if (!profile || !profile.email) {
    return loginError("Couldn't read your Google account — please try again.");
  }

  const user = await findOrCreateUser(profile.email, { name: profile.name });
  await createSession(user.id);

  // requireOnboardedUser on "/" will forward first-time users to /welcome.
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
