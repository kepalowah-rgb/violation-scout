"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSession, signOut } from "next-auth/react";
import { PRICING } from "@/config/pricing";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-700 text-white font-bold">
            ◆
          </span>
          <span className="font-semibold tracking-tight">{PRICING.productName}</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/#pricing" className="hidden sm:inline text-stone-600 hover:text-stone-900">
            {t("pricing")}
          </Link>
          <Link href="/help" className="hidden sm:inline text-stone-600 hover:text-stone-900">
            {t("help")}
          </Link>
          {status === "loading" ? null : session ? (
            <>
              <Link href="/dashboard/settings" className="hidden sm:inline text-stone-600 hover:text-stone-900">
                {t("settings")}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800"
              >
                {t("dashboard")}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/` })}
                className="text-stone-600 hover:text-stone-900"
              >
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 hover:text-stone-900">
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800"
              >
                {t("startTrial")}
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
