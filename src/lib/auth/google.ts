// Minimal Google OAuth 2.0 (authorization-code) helpers — no external SDK.
// Google sign-in is optional: the "Continue with Google" button only appears
// when GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are set, the same "configure to
// enable, otherwise hidden" pattern used for Resend email and Vercel Blob.

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * The redirect URI Google calls back. Must match exactly what's registered in
 * the Google Cloud console. Derived from the request's own origin so it works
 * on localhost and in production without extra config; override with
 * GOOGLE_REDIRECT_URI if you need to pin it.
 */
export function googleRedirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
}

export function googleAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleProfile {
  email: string;
  name: string | null;
  emailVerified: boolean;
}

/** Exchanges the auth code for tokens and returns the user's Google profile. */
export async function exchangeCodeForProfile(code: string, origin: string): Promise<GoogleProfile | null> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return null;
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return null;

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!infoRes.ok) return null;
  const info = (await infoRes.json()) as { email?: string; name?: string; email_verified?: boolean };
  if (!info.email) return null;

  return { email: info.email, name: info.name ?? null, emailVerified: info.email_verified ?? false };
}
