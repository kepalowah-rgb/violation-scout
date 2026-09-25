"use client";

// Help Center UI: searchable FAQ, troubleshooting guides, and the contact
// form. All content comes from the translated message catalog ("help"
// namespace); this component only presents it.

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import SupportForm from "./SupportForm";

interface FaqItem {
  q: string;
  a: string;
}
interface FaqTopic {
  id: string;
  title: string;
  blurb: string;
  items: FaqItem[];
}
interface TroubleshootGuide {
  id: string;
  title: string;
  symptoms: string[];
  causes: string[];
  steps: string[];
  contactWhen: string;
}

export default function HelpClient({ initialTopic }: { initialTopic?: string | null }) {
  const t = useTranslations("help");
  const tp = useTranslations("support");
  const [query, setQuery] = useState("");

  const topics = t.raw("topics") as FaqTopic[];
  const guides = t.raw("troubleshooting") as TroubleshootGuide[];

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    const hits: { topic: string; q: string; a: string }[] = [];
    for (const topic of topics) {
      for (const item of topic.items) {
        if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
          hits.push({ topic: topic.title, q: item.q, a: item.a });
        }
      }
    }
    for (const g of guides) {
      const hay = [g.title, ...g.symptoms, ...g.causes, ...g.steps].join(" ").toLowerCase();
      if (hay.includes(q)) {
        hits.push({ topic: t("troubleshootingTitle"), q: g.title, a: `${t("symptoms")}: ${g.symptoms.join(" ")}` });
      }
    }
    return hits;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, topics, guides]);

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-stone-900"
          >
            {t("clear")}
          </button>
        )}
      </div>

      {results ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">
            {t("results", { count: results.length, query: query.trim() })}
          </h2>
          {results.length === 0 ? (
            <div className="mt-4 rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
              <p>{t("noResults")}</p>
              <p className="mt-2">
                {t("stillStuck")}{" "}
                <a href="#contact" className="font-medium text-emerald-700 hover:underline">
                  {t("contactTitle")}
                </a>
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {results.map((r, i) => (
                <details key={i} className="group rounded-xl border border-stone-200 bg-white px-5 py-4">
                  <summary className="cursor-pointer list-none">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{r.topic}</span>
                    <span className="block font-medium text-stone-900 group-open:mb-2">{r.q}</span>
                  </summary>
                  <p className="text-sm leading-relaxed text-stone-600">{r.a}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Topic quick-nav */}
          <nav aria-label={t("kicker")} className="mt-8 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <a
                key={topic.id}
                href={`#${topic.id}`}
                className="rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm text-stone-700 hover:border-emerald-600 hover:text-emerald-800"
              >
                {topic.title}
              </a>
            ))}
            <a
              href="#troubleshooting"
              className="rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm text-stone-700 hover:border-emerald-600 hover:text-emerald-800"
            >
              {t("troubleshootingTitle")}
            </a>
          </nav>

          {/* FAQ topics */}
          {topics.map((topic) => (
            <section key={topic.id} id={topic.id} className="mt-12 scroll-mt-24">
              <h2 className="text-xl font-bold tracking-tight">{topic.title}</h2>
              <p className="mt-1 text-sm text-stone-500">{topic.blurb}</p>
              <div className="mt-4 space-y-3">
                {topic.items.map((item, i) => (
                  <details key={i} className="group rounded-xl border border-stone-200 bg-white px-5 py-4">
                    <summary className="cursor-pointer list-none font-medium text-stone-900 marker:hidden [&::-webkit-details-marker]:hidden">
                      <span className="flex items-start justify-between gap-4">
                        {item.q}
                        <span className="shrink-0 text-stone-400 group-open:rotate-45 group-open:text-emerald-700 text-lg leading-none">+</span>
                      </span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* Troubleshooting */}
          <section id="troubleshooting" className="mt-12 scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight">{t("troubleshootingTitle")}</h2>
            <p className="mt-1 text-sm text-stone-500">{t("troubleshootingSub")}</p>
            <div className="mt-4 space-y-4">
              {guides.map((g) => (
                <details key={g.id} id={`fix-${g.id}`} className="group scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6">
                  <summary className="cursor-pointer list-none marker:hidden [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      <span className="font-semibold text-stone-900">{g.title}</span>
                      <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        {t("fixGuide")}
                      </span>
                    </span>
                  </summary>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-stone-800">{t("symptoms")}</h4>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-stone-600">
                        {g.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800">{t("causes")}</h4>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-stone-600">
                        {g.causes.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800">{t("stepsTitle")}</h4>
                      <ol className="mt-1 list-decimal space-y-1 pl-5 text-stone-600">
                        {g.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </div>
                    <div className="rounded-lg bg-stone-100 p-4">
                      <h4 className="font-semibold text-stone-800">{t("contactWhen")}</h4>
                      <p className="mt-1 text-stone-600">{g.contactWhen}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Contact */}
      <section id="contact" className="mt-12 scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight">{t("contactTitle")}</h2>
        <p className="mt-1 text-sm text-stone-500">
          {t("contactSub", { promise: tp("responsePromise") })}
        </p>
        <div className="mt-6">
          <SupportForm initialTopic={initialTopic} />
        </div>
      </section>
    </div>
  );
}
