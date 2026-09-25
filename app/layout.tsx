// Root layout: intentionally minimal. The locale-aware chrome (navbar,
// footer, i18n provider) lives in app/[locale]/layout.tsx. The <html lang>
// attribute follows the *request* locale: next-intl's middleware stamps
// X-NEXT-INTL-LOCALE on the request headers when it continues (rewrite or
// next()), so the very first SSR render already matches the URL locale.
// Falls back to the persisted NEXT_LOCALE cookie, then the default locale.

import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Violation Scout",
};

function pickLocale(values: (string | null | undefined)[]): string {
  const locales = routing.locales as readonly string[];
  for (const v of values) {
    const l = v?.toLowerCase();
    if (l && locales.includes(l)) return l;
  }
  return routing.defaultLocale;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const lang = pickLocale([
    headerStore.get("X-NEXT-INTL-LOCALE"),
    cookieStore.get("NEXT_LOCALE")?.value,
  ]);

  return (
    <html lang={lang} className="h-full">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
