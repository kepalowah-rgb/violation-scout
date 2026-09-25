// Server-only helper: localizes research checklist step templates into
// display strings using the caller's locale (from the NEXT_LOCALE cookie).
// Used by app/api/properties/route.ts when seeding a new lead's checklist.

import { createTranslator } from "next-intl";
import {
  buildResearchStepTemplates,
  type ResolvedRegion,
  type ResearchStepTemplate,
} from "@/config/research";
import { routing } from "@/i18n/routing";

const catalogs: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("@/messages/en.json"),
  es: () => import("@/messages/es.json"),
  tl: () => import("@/messages/tl.json"),
};

/** Resolve the request locale from the cookie, falling back to default. */
export async function getRequestLocaleFromCookies(): Promise<string> {
  const { cookies } = await import("next/headers");
  const v = (await cookies()).get("NEXT_LOCALE")?.value;
  return (routing.locales as readonly string[]).includes(v ?? "")
    ? (v as string)
    : routing.defaultLocale;
}

export interface LocalizedStep {
  label: string;
  hint: string;
  url?: string;
}

export async function buildLocalizedResearchSteps(
  region: ResolvedRegion,
  locale: string
): Promise<LocalizedStep[]> {
  const load = catalogs[locale] ?? catalogs[routing.defaultLocale];
  const messages = (await load()).default;
  // Typed loosely: the catalog is loaded dynamically per locale.
  const t = createTranslator({ locale, messages }) as unknown as (
    key: string,
    values?: Record<string, string>
  ) => string;
  const templates: ResearchStepTemplate[] = buildResearchStepTemplates(region);
  return templates.map((s) => ({
    label: t(`research.${s.labelKey}`, s.labelParams),
    hint: t(`research.${s.hintKey}`, s.hintParams),
    url: s.url,
  }));
}
