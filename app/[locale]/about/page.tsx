import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRICING } from "@/config/pricing";

// Public About page — the founder story. The owner MUST personalize this
// before launch: name, photo, and story details. See README
// ("Personalizing the About page") for the exact checklist.

interface Belief {
  title: string;
  body: string;
}

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: t("title"), description: t("subtitle") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tp = await getTranslations("pricing");
  const price = tp("price", { price: PRICING.monthlyPriceDollars });
  const trial = tp("trial", { days: PRICING.trialDays });
  const story = t.raw("story") as string[];
  const whyBullets = t.raw("whyBullets") as string[];
  const beliefs = t.raw("beliefs") as Belief[];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {PRICING.productName}
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-6 max-w-2xl text-lg text-emerald-100">{t("subtitle")}</p>
        </div>
      </section>

      {/* Founder story */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {t("founderEyebrow")}
        </p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Founder photo slot — owner replaces with their photo at
              public/founder.jpg (see README). */}
          <div className="shrink-0">
            <div className="grid h-40 w-40 place-items-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-stone-200 text-2xl text-stone-400">
                  ☺
                </div>
                <p className="mt-2 px-3 text-xs text-stone-400">{t("photoPlaceholder")}</p>
              </div>
            </div>
          </div>
          <div>
            {/* Owner: replace "[Your Name]" in messages/{en,es,tl}.json → about.name */}
            <h2 className="text-2xl font-bold tracking-tight">{t("name")}</h2>
            <p className="mt-1 text-sm text-stone-500">{t("role")}</p>
            <div className="mt-4 space-y-4 text-stone-700">
              {story.map((p, i) => (
                <p key={i} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why it exists */}
      <section className="border-y border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-3xl font-bold tracking-tight">{t("whyTitle")}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {whyBullets.map((_, i) => (
              <li key={i} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  ✓
                </span>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">
                  {t(`whyBullets.${i}`, { price, trial })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What we believe */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-3xl font-bold tracking-tight">{t("beliefsTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {beliefs.map((bl) => (
            <div key={bl.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold">{bl.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{bl.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-950">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-emerald-100">{t("ctaBody")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-300"
            >
              {t("ctaTrial")}
            </Link>
            <Link
              href="/help"
              className="rounded-xl border border-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              {t("ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
