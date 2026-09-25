"use client";

// Create / edit form for a property lead. When opened from the map, lat/lng
// are prefilled from the dropped pin; the address is always typed by the user
// (no geocoding API key needed).

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  PROPERTY_STATUSES,
  PROPERTY_PRIORITIES,
  type PropertyT,
} from "@/lib/lead-types";

export interface PropertyFormValues {
  address: string;
  city: string;
  zip: string;
  tmk: string;
  lat: number | null;
  lng: number | null;
  distressNotes: string;
  suspectedViolations: string;
  status: string;
  priority: string;
  followUpDate: string;
  virtualTourUrl: string;
}

function toValues(p?: PropertyT, picked?: { lat: number; lng: number }): PropertyFormValues {
  return {
    address: p?.address ?? "",
    city: p?.city ?? "Nanakuli",
    zip: p?.zip ?? "",
    tmk: p?.tmk ?? "",
    lat: p?.lat ?? picked?.lat ?? null,
    lng: p?.lng ?? picked?.lng ?? null,
    distressNotes: p?.distressNotes ?? "",
    suspectedViolations: p?.suspectedViolations ?? "",
    status: p?.status ?? "new",
    priority: p?.priority ?? "medium",
    followUpDate: p?.followUpDate ? p.followUpDate.slice(0, 10) : "",
    virtualTourUrl: p?.virtualTourUrl ?? "",
  };
}

const PRIORITY_KEYS: Record<string, string> = {
  low: "priorityLow",
  medium: "priorityMedium",
  high: "priorityHigh",
};

const inputCls =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none";

export default function PropertyForm({
  initial,
  picked,
  saving,
  onSave,
  onCancel,
}: {
  initial?: PropertyT;
  picked?: { lat: number; lng: number } | null;
  saving: boolean;
  onSave: (values: PropertyFormValues) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("propertyForm");
  const ts = useTranslations("status");
  const [v, setV] = useState<PropertyFormValues>(() => toValues(initial, picked ?? undefined));
  const [tourError, setTourError] = useState("");
  const set = (k: keyof PropertyFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setV({ ...v, [k]: e.target.value });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = v.virtualTourUrl.trim();
    if (url && !/^https?:\/\/.+\..+/.test(url)) {
      setTourError(t("virtualTourInvalid"));
      return;
    }
    setTourError("");
    if (v.address.trim()) onSave({ ...v, virtualTourUrl: url });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">{t("address")}</label>
        <input className={inputCls} value={v.address} onChange={set("address")} required
          placeholder={t("addressPlaceholder")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">{t("city")}</label>
          <input className={inputCls} value={v.city} onChange={set("city")} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("zip")}</label>
          <input className={inputCls} value={v.zip} onChange={set("zip")} placeholder={t("zipPlaceholder")} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("tmk")}</label>
          <input className={inputCls} value={v.tmk} onChange={set("tmk")} placeholder={t("tmkPlaceholder")} />
        </div>
      </div>
      {v.lat != null && v.lng != null && (
        <p className="text-xs text-stone-500">
          {t("pinnedAt", { lat: v.lat.toFixed(5), lng: v.lng.toFixed(5) })}
        </p>
      )}
      <div>
        <label className="text-sm font-medium">{t("distressNotes")}</label>
        <textarea className={inputCls} rows={3} value={v.distressNotes} onChange={set("distressNotes")}
          placeholder={t("distressPlaceholder")} />
      </div>
      <div>
        <label className="text-sm font-medium">{t("suspectedViolations")}</label>
        <textarea className={inputCls} rows={2} value={v.suspectedViolations} onChange={set("suspectedViolations")}
          placeholder={t("violationsPlaceholder")} />
      </div>
      <div>
        <label className="text-sm font-medium">{t("virtualTour")}</label>
        <input
          className={inputCls}
          value={v.virtualTourUrl}
          onChange={set("virtualTourUrl")}
          placeholder={t("virtualTourPlaceholder")}
          inputMode="url"
        />
        <p className="mt-1 text-xs text-stone-500">{t("virtualTourHint")}</p>
        {tourError && <p className="mt-1 text-xs text-red-600">{tourError}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">{t("status")}</label>
          <select className={inputCls} value={v.status} onChange={set("status")}>
            {PROPERTY_STATUSES.map((s) => (
              <option key={s} value={s}>{ts(s as "new")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">{t("priority")}</label>
          <select className={inputCls} value={v.priority} onChange={set("priority")}>
            {PROPERTY_PRIORITIES.map((p) => (
              <option key={p} value={p}>{ts(PRIORITY_KEYS[p] as "priorityLow")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">{t("followUp")}</label>
          <input type="date" className={inputCls} value={v.followUpDate} onChange={set("followUpDate")} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">
          {t("cancel")}
        </button>
        <button type="submit" disabled={saving}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {saving ? t("saving") : initial ? t("saveChanges") : t("addLead")}
        </button>
      </div>
    </form>
  );
}
