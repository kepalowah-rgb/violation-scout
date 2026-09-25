"use client";

// Form for creating / editing a wholesale assignment contract draft.
// Saved drafts can be opened in the printable view (new tab) for review,
// attorney sign-off and signatures.
//
// NOTE: only the builder labels are translated. The generated legal document
// itself (ContractDocument) stays in English — that is the language it would
// be reviewed and enforced in.

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ContractT, PropertyT } from "@/lib/lead-types";

export interface ContractFormValues {
  template: string; // "hawaii" | "generic"
  propertyId: string;
  sellerName: string;
  propertyAddress: string;
  tmk: string;
  purchasePrice: string;
  earnestMoney: string;
  assignmentFee: string;
  closingDate: string;
  inspectionDays: string;
  additionalTerms: string;
}

export const CONTRACT_TEMPLATES = [
  { id: "hawaii", nameKey: "templateHawaiiName", descKey: "templateHawaiiDesc" },
  { id: "generic", nameKey: "templateGenericName", descKey: "templateGenericDesc" },
] as const;

function toValues(c?: ContractT, presetAddress?: string): ContractFormValues {
  return {
    template: c?.template === "generic" ? "generic" : "hawaii",
    propertyId: c?.propertyId ?? "",
    sellerName: c?.sellerName ?? "",
    propertyAddress: c?.propertyAddress ?? presetAddress ?? "",
    tmk: c?.tmk ?? "",
    purchasePrice: c ? String(c.purchasePrice) : "",
    earnestMoney: c ? String(c.earnestMoney) : "0",
    assignmentFee: c ? String(c.assignmentFee) : "",
    closingDate: c?.closingDate ? c.closingDate.slice(0, 10) : "",
    inspectionDays: c ? String(c.inspectionDays) : "10",
    additionalTerms: c?.additionalTerms ?? "",
  };
}

const inputCls =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none";

export default function ContractBuilder({
  initial,
  properties,
  presetAddress,
  saving,
  onSave,
  onCancel,
}: {
  initial?: ContractT;
  properties: PropertyT[];
  presetAddress?: string;
  saving: boolean;
  onSave: (values: ContractFormValues) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("contractBuilder");
  const [v, setV] = useState<ContractFormValues>(() => toValues(initial, presetAddress));
  const set = (k: keyof ContractFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setV({ ...v, [k]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v.sellerName.trim() && v.propertyAddress.trim() && v.purchasePrice) onSave(v);
      }}
      className="space-y-4"
    >
      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        <strong>{t("draftNotice")}</strong>{" "}
        {v.template === "generic" ? t("genericNotice") : t("hawaiiNotice")}
      </div>

      <div>
        <p className="text-sm font-medium">{t("templateLabel")}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {CONTRACT_TEMPLATES.map((tpl) => (
            <label
              key={tpl.id}
              className={`cursor-pointer rounded-lg border p-3 ${
                v.template === tpl.id
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-stone-200 hover:bg-stone-50"
              }`}
            >
              <input
                type="radio"
                name="template"
                value={tpl.id}
                checked={v.template === tpl.id}
                onChange={() => setV({ ...v, template: tpl.id })}
                className="accent-emerald-700"
              />
              <span className="ml-2 text-sm font-medium">{t(tpl.nameKey as "templateHawaiiName")}</span>
              <span className="mt-1 block text-xs text-stone-500">{t(tpl.descKey as "templateHawaiiDesc")}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{t("linkLead")}</label>
        <select className={inputCls} value={v.propertyId} onChange={set("propertyId")}>
          <option value="">{t("noLink")}</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.address}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">{t("sellerName")}</label>
        <input className={inputCls} value={v.sellerName} onChange={set("sellerName")} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-sm font-medium">{t("propertyAddress")}</label>
          <input className={inputCls} value={v.propertyAddress} onChange={set("propertyAddress")} required />
        </div>
        <div>
          <label className="text-sm font-medium">{t("tmk")}</label>
          <input className={inputCls} value={v.tmk} onChange={set("tmk")} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("closingDate")}</label>
          <input type="date" className={inputCls} value={v.closingDate} onChange={set("closingDate")} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("purchasePrice")}</label>
          <input type="number" min="0" step="0.01" className={inputCls} value={v.purchasePrice} onChange={set("purchasePrice")} required />
        </div>
        <div>
          <label className="text-sm font-medium">{t("earnestMoney")}</label>
          <input type="number" min="0" step="0.01" className={inputCls} value={v.earnestMoney} onChange={set("earnestMoney")} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("assignmentFee")}</label>
          <input type="number" min="0" step="0.01" className={inputCls} value={v.assignmentFee} onChange={set("assignmentFee")}
            placeholder={t("assignmentFeePlaceholder")} />
        </div>
        <div>
          <label className="text-sm font-medium">{t("inspectionDays")}</label>
          <input type="number" min="0" step="1" className={inputCls} value={v.inspectionDays} onChange={set("inspectionDays")} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">{t("additionalTerms")}</label>
        <textarea className={inputCls} rows={3} value={v.additionalTerms} onChange={set("additionalTerms")}
          placeholder={t("additionalTermsPlaceholder")} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">{t("cancel")}</button>
        <button type="submit" disabled={saving}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {saving ? t("saving") : initial ? t("saveChanges") : t("createDraft")}
        </button>
      </div>
    </form>
  );
}
