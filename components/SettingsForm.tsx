"use client";

// Region settings form: pick the Hawaiʻi preset or enter custom county
// lookup URLs. Saved per user via /api/settings.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { REGIONS, HAWAII_OWNER_LINKS, HAWAII_VIOLATION_LINKS, type RegionId } from "@/config/research";

export interface SettingsValues {
  region: string;
  customAssessorLabel: string;
  customAssessorUrl: string;
  customViolationLabel: string;
  customViolationUrl: string;
}

const inputCls =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none";

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const t = useTranslations("settings");
  const tr = useTranslations("research");
  const [v, setV] = useState<SettingsValues>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof SettingsValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV({ ...v, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      if (v.region === "custom" && !v.customAssessorUrl.trim()) {
        throw new Error(t("needAssessorUrl"));
      }
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Save failed (${res.status})`);
      setMessage({ ok: true, text: t("savedOk") });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-stone-200 bg-white p-6">
      <div>
        <p className="text-sm font-semibold">{t("regionLabel")}</p>
        <div className="mt-2 space-y-2">
          {REGIONS.map((r) => (
            <label
              key={r.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                v.region === r.id ? "border-emerald-600 bg-emerald-50" : "border-stone-200 hover:bg-stone-50"
              }`}
            >
              <input
                type="radio"
                name="region"
                value={r.id}
                checked={v.region === r.id}
                onChange={() => setV({ ...v, region: r.id })}
                className="mt-1 accent-emerald-700"
              />
              <span>
                <span className="block text-sm font-medium">
                  {tr(`regions.${r.id as RegionId}.name`)}
                </span>
                <span className="block text-xs text-stone-500">
                  {tr(`regions.${r.id as RegionId}.description`)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {v.region === "hawaii" && (
        <div className="rounded-lg bg-stone-50 p-4 text-xs text-stone-600">
          <p className="font-semibold text-stone-800">{t("hawaiiLookups")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {HAWAII_OWNER_LINKS.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 hover:underline">
                  {l.label} ↗
                </a>
              </li>
            ))}
            {HAWAII_VIOLATION_LINKS.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 hover:underline">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {v.region === "custom" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{t("customNote")}</div>
          <div>
            <label className="text-sm font-medium">{t("assessorSiteName")}</label>
            <input
              className={inputCls}
              value={v.customAssessorLabel}
              onChange={set("customAssessorLabel")}
              placeholder={t("assessorSitePlaceholder")}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("assessorUrl")}</label>
            <input
              className={inputCls}
              value={v.customAssessorUrl}
              onChange={set("customAssessorUrl")}
              placeholder={t("urlPlaceholder")}
              inputMode="url"
            />
            <p className="mt-1 text-xs text-stone-500">{t("assessorUrlHint")}</p>
          </div>
          <div>
            <label className="text-sm font-medium">{t("violationSiteName")}</label>
            <input
              className={inputCls}
              value={v.customViolationLabel}
              onChange={set("customViolationLabel")}
              placeholder={t("violationSitePlaceholder")}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("violationUrl")}</label>
            <input
              className={inputCls}
              value={v.customViolationUrl}
              onChange={set("customViolationUrl")}
              placeholder={t("urlPlaceholder")}
              inputMode="url"
            />
            <p className="mt-1 text-xs text-stone-500">{t("violationUrlHint")}</p>
          </div>
        </div>
      )}

      {message && (
        <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}
