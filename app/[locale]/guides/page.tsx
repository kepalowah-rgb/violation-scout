// Public education guides — no login required.
//
// Practical, Hawaiʻi-focused wholesaling explainers. Every article carries
// an "educational only, not legal advice" banner. Content comes from the
// translated message catalog ("guides" namespace).

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface GuideArticle {
  slug: string;
  title: string;
  blurb: string;
}

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("guidesTitle"), description: t("guidesDescription") };
}

export default async function GuidesPage() {
  const t = await getTranslations("guides");
  const articles = t.raw("articles") as GuideArticle[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Violation Scout</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-sm text-stone-600">{t("sub")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/guides/${a.slug}`}
            className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow"
          >
            <h2 className="font-semibold group-hover:text-emerald-800">{a.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{a.blurb}</p>
            <p className="mt-3 text-sm font-medium text-emerald-700">{t("readMore")} →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
