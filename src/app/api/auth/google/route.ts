import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { isGoogleConfigured, googleAuthUrl } from "@/lib/auth/google";

const STATE_COOKIE = "g_oauth_state";

// Kicks off Google sign-in: sets a random state cookie (CSRF guard) and
// redirects to Google's consent screen.
export function GET(request: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=Google+sign-in+is+not+configured", request.url));
  }
  const state = randomBytes(16).toString("hex");
  const origin = request.nextUrl.origin;
  const res = NextResponse.redirect(googleAuthUrl(origin, state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
