import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRICING } from "@/config/pricing";
import { TESTIMONIALS } from "@/config/testimonials";

interface FeatureItem {
  title: string;
  body: string;
}
interface FaqItem {
  q: string;
  a: string;
}

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("landingTitle"), description: t("landingDescription") };
}

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tp = await getTranslations("pricing");
  const trial = tp("trial", { days: PRICING.trialDays });
  const price = tp("price", { price: PRICING.monthlyPriceDollars });
  const features = t.raw("features") as FeatureItem[];
  const faqs = t.raw("faqs") as FaqItem[];
  const planBullets = t.raw("planBullets") as string[];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 inline-block rounded-full bg-emerald-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
            {t("badge")}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">{t("hero")}</h1>
          <p className="mt-6 max-w-2xl text-lg text-emerald-100">{t("sub", { price, trial })}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-300"
            >
              {t("ctaTrial", { trial })}
            </Link>
            <Link
              href="/#how"
              className="rounded-xl border border-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              {t("ctaHow")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-emerald-200">{t("trialNote", { days: PRICING.trialDays })}</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">{t("howTitle")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                {i + 1}
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attorney review trust strip */}
      <section className="border-y border-violet-200 bg-violet-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-700 text-lg text-white">
              ⚖
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t("attorneyLine")}</h2>
              <p className="mt-2 max-w-3xl text-sm text-stone-600">{t("attorneySub")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight">{t("pricingTitle")}</h2>
          <p className="mt-2 text-stone-600">{t("pricingSub")}</p>
          <div className="mt-8 max-w-md rounded-2xl border-2 border-emerald-700 p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              {PRICING.productName}
            </p>
            <p className="mt-4">
              <span className="text-5xl font-bold">${PRICING.monthlyPriceDollars}</span>
              <span className="text-stone-500">{t("perMonth")}</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {planBullets.map((_, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-700">✓</span>
                  <span>{t(`planBullets.${i}`, { trial })}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 block rounded-xl bg-emerald-700 px-6 py-3 text-center font-semibold text-white hover:bg-emerald-800"
            >
              {t("ctaTrial", { trial })}
            </Link>
            <p className="mt-4 flex items-start gap-2 text-sm text-stone-600">
              <span className="text-emerald-700">✓</span>
              <span>{t("guaranteeNote")}</span>
            </p>
            <p className="mt-3 text-sm">
              <Link href="/sample-contract" className="font-medium text-emerald-700 hover:underline">
                {t("sampleCta")} →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Your data is yours */}
      <section className="border-y border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight">{t("dataTitle")}</h2>
          <p className="mt-2 text-stone-600">{t("dataSub")}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {(t.raw("dataBullets") as string[]).map((b, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-5 text-sm">
                <span className="text-emerald-700">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials — real entries only, from config/testimonials.ts */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">{t("testimonialsTitle")}</h2>
        <p className="mt-2 text-stone-600">{t("testimonialsSub")}</p>
        {TESTIMONIALS.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-xl font-semibold">{t("testimonialsEmptyTitle")}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">{t("testimonialsEmptyBody")}</p>
            <Link
              href={{ pathname: "/help", query: { topic: "success-story" }, hash: "contact" }}
              className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              {t("testimonialsEmptyCta")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((s) => (
              <figure key={s.name} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <blockquote className="text-sm text-stone-700">“{s.quote}”</blockquote>
                <figcaption className="mt-4">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-stone-500">{s.location}</p>
                  <p className="mt-2 text-xs font-medium text-emerald-700">{s.deal}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold tracking-tight">{t("faqTitle")}</h2>
        <div className="mt-8 space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-2 text-sm text-stone-600">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-emerald-700 px-8 py-4 font-semibold text-white hover:bg-emerald-800"
          >
            {t("ctaTrial", { trial })}
          </Link>
        </div>
      </section>
    </div>
  );
}
