import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Remember",
  description: "Tag shops and items you spot so you can find your way back to buy them later.",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Remember" },
};

export const viewport: Viewport = {
  themeColor: "#d97706",
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
              <Link href="/" className="shrink-0 whitespace-nowrap text-lg font-semibold tracking-tight">
                📍 Remember
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
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
