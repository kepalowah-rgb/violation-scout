// Public guide article page.
//
// The slug is looked up in the translated "guides" catalog; unknown slugs
// 404. Every article opens with the educational-only / not-legal-advice
// banner. IMPORTANT: these guides were written as general educational
// explainers — a Hawaiʻi attorney should review them before launch.

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

interface GuideSection {
  h: string;
  p: string;
}
interface GuideArticle {
  slug: string;
  title: string;
  blurb: string;
  intro: string;
  sections: GuideSection[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("guides");
  const articles = t.raw("articles") as GuideArticle[];
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return { title: `${article.title} | Violation Scout`, description: article.blurb };
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("guides");
  const articles = t.raw("articles") as GuideArticle[];
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/guides" className="text-sm font-medium text-emerald-700 hover:underline">
        {t("backToGuides")}
      </Link>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">{article.title}</h1>

      <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-900">{t("bannerTitle")}</p>
        <p className="mt-1 text-sm text-amber-900">{t("bannerBody")}</p>
      </div>

      <p className="mt-6 leading-relaxed text-stone-700">{article.intro}</p>

      <div className="mt-8 space-y-8">
        {article.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-stone-700">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm text-stone-600">{t("bannerBody")}</p>
        <Link
          href="/signup"
          className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
        >
          {t("ctaTrial")}
        </Link>
      </div>
    </div>
  );
}
