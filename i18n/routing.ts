// Central i18n routing configuration (next-intl).
//
// ADDING A NEW LANGUAGE:
//   1. Add the locale code to `locales` below.
//   2. Add `messages/<code>.json` (copy messages/en.json and translate).
//   3. Add the label to LOCALE_LABELS in components/LanguageSwitcher.tsx.
// That's it — routing, middleware, and the switcher pick it up automatically.

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "tl"],
  defaultLocale: "en",
  // "always" => every page URL carries its locale: /es/dashboard, /tl/help …
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});

export type Locale = (typeof routing.locales)[number];
