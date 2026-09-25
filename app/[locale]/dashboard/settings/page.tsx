// Region settings page: choose the Hawaiʻi preset or point the research
// checklist at your own county's official lookups. Changes apply to
// checklists for leads added from now on; existing leads are untouched.

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("settingsTitle") };
}

export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations("settings");
  const user = await db.user.findUnique({
    where: { id: session!.user!.id! },
    select: {
      region: true,
      customAssessorLabel: true,
      customAssessorUrl: true,
      customViolationLabel: true,
      customViolationUrl: true,
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-stone-600">{t("sub")}</p>
      <div className="mt-6">
        <SettingsForm
          initial={{
            region: user?.region ?? "hawaii",
            customAssessorLabel: user?.customAssessorLabel ?? "",
            customAssessorUrl: user?.customAssessorUrl ?? "",
            customViolationLabel: user?.customViolationLabel ?? "",
            customViolationUrl: user?.customViolationUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
