"use client";

// Language switcher: persists the choice in the NEXT_LOCALE cookie (1 year)
// and navigates to the same page under the new locale prefix.
// ADDING A LANGUAGE: add the locale code + label here (and to i18n/routing.ts
// plus messages/<code>.json) — nothing else needs to change.

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  es: "Español",
  tl: "Tagalog",
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export default function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    if (nextLocale === locale) return;
    document.cookie =
      `NEXT_LOCALE=${nextLocale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    const search = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${pathname}${search}${hash}`, { locale: nextLocale });
  }

  return (
    <label className="flex items-center gap-1 text-stone-600">
      <span className="sr-only">{t("language")}</span>
      <span aria-hidden="true">🌐</span>
      <select
        value={locale}
        onChange={onChange}
        aria-label={t("language")}
        className="cursor-pointer rounded-md border border-stone-200 bg-white px-1 py-1 text-xs text-stone-700 hover:border-stone-300 focus:border-emerald-600 focus:outline-none"
      >
        {(routing.locales as readonly string[]).map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l] ?? l}
          </option>
        ))}
      </select>
    </label>
  );
}
