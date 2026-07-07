import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { BrandLock } from "@/components/Logo";
import { BILLING_ENABLED } from "@/lib/features";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tag It",
  description: "You find it, just tag it — tag shops and items you spot so you can find your way back.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Tag It" },
};

export const viewport: Viewport = {
  themeColor: "#ff5e7e",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {user && (
          <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
              <Link href="/" className="shrink-0">
                <BrandLock size={30} wordClass="text-lg" />
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {BILLING_ENABLED && (
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-1.5 hover:text-zinc-950 dark:hover:text-zinc-100"
                  >
                    <span>Plan</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        user.plan === "PRO"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {user.plan}
                    </span>
                  </Link>
                )}
                <span className="hidden text-zinc-400 sm:inline dark:text-zinc-500">{user.email}</span>
                <form action={logoutAction}>
                  <button type="submit" className="hover:text-zinc-950 dark:hover:text-zinc-100">
                    Sign out
                  </button>
                </form>
              </nav>
            </div>
          </header>
        )}
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-5 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
