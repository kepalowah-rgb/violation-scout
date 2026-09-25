// Public Help Center — accessible to logged-in and logged-out users
// (proxy.ts only gates /dashboard/* and /billing/*, so /help is open).

import { getTranslations } from "next-intl/server";
import HelpClient from "@/components/HelpClient";
import { SUPPORT_TOPICS } from "@/config/support";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("helpTitle"), description: t("helpDescription") };
}

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const t = await getTranslations("help");
  const sp = await searchParams;
  // Lets links like /help?topic=refund#contact pre-select the support form topic.
  const initialTopic =
    sp.topic && (SUPPORT_TOPICS as readonly string[]).includes(sp.topic) ? sp.topic : null;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{t("kicker")}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-sm text-stone-600">{t("sub")}</p>
      <div className="mt-8">
        <HelpClient initialTopic={initialTopic} />
      </div>
    </div>
  );
}
