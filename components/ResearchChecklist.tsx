"use client";

// Per-property research checklist. Steps link out to the official public
// lookups (RPAD, qPublic, HNL Build via DPP). Statuses and dated notes keep
// confirmed findings separate from field suspicions. The remote evaluation
// section (photos, virtual tour link, condition report) sits below the
// checklist for properties the user can't visit in person.

import { useState } from "react";
import { useTranslations } from "next-intl";
import RemoteEvaluation from "./RemoteEvaluation";
import type { ConditionItemT, PropertyPhotoT, PropertyT, ResearchItemT } from "@/lib/lead-types";

const STEP_STATUS = ["todo", "in_progress", "done"] as const;
const STEP_KEYS: Record<(typeof STEP_STATUS)[number], string> = {
  todo: "stepTodo",
  in_progress: "stepInProgress",
  done: "stepDone",
};

export default function ResearchChecklist({
  property,
  onItemUpdate,
  onItemDelete,
  onItemAdd,
  onOwnerSave,
  onPropertyUpdate,
}: {
  property: PropertyT;
  onItemUpdate: (itemId: string, patch: Partial<ResearchItemT>) => void;
  onItemDelete: (itemId: string) => void;
  onItemAdd: (propertyId: string, label: string) => void;
  onOwnerSave: (propertyId: string, ownerName: string) => void;
  onPropertyUpdate: (id: string, patch: Partial<PropertyT>) => void;
}) {
  const t = useTranslations("research");
  const [newStep, setNewStep] = useState("");
  const [owner, setOwner] = useState(property.ownerName ?? "");
  const done = property.researchItems.filter((i) => i.status === "done").length;
  const total = property.researchItems.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{property.address}</h3>
        <p className="text-sm text-stone-500">
          {property.city} {property.zip ?? ""} {property.tmk ? `· TMK ${property.tmk}` : ""}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-stone-500">{t("stepsDone", { done, total })}</p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <label className="text-sm font-medium">{t("ownerLabel")}</label>
        <p className="text-xs text-stone-500">{t("ownerHint")}</p>
        <div className="mt-2 flex gap-2">
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder={t("ownerPlaceholder")}
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
          />
          <button
            onClick={() => onOwnerSave(property.id, owner.trim())}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            {t("save")}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {property.researchItems.map((item) => (
          <div key={item.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                {item.notes && <p className="mt-1 text-xs text-stone-500">{item.notes}</p>}
              </div>
              <select
                value={item.status}
                onChange={(e) => onItemUpdate(item.id, { status: e.target.value })}
                className="rounded border border-stone-300 px-2 py-1 text-xs"
              >
                {STEP_STATUS.map((s) => (
                  <option key={s} value={s}>{t(STEP_KEYS[s] as "stepTodo")}</option>
                ))}
              </select>
            </div>
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noreferrer"
                className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:underline">
                {t("openLookup")}
              </a>
            )}
            <textarea
              defaultValue={item.notes ?? ""}
              placeholder={t("notesPlaceholder")}
              rows={2}
              onBlur={(e) => {
                if (e.target.value !== (item.notes ?? "")) {
                  onItemUpdate(item.id, { notes: e.target.value });
                }
              }}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
            />
            <button
              onClick={() => { if (confirm(t("deleteStepConfirm"))) onItemDelete(item.id); }}
              className="mt-1 text-xs text-stone-400 hover:text-red-600"
            >
              {t("removeStep")}
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          placeholder={t("addStepPlaceholder")}
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
        />
        <button
          onClick={() => { if (newStep.trim()) { onItemAdd(property.id, newStep.trim()); setNewStep(""); } }}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100"
        >
          {t("add")}
        </button>
      </div>

      <RemoteEvaluation
        property={property}
        onPhotosChange={(photos: PropertyPhotoT[]) => onPropertyUpdate(property.id, { photos })}
        onConditionsChange={(conditionItems: ConditionItemT[]) =>
          onPropertyUpdate(property.id, { conditionItems })
        }
      />
    </div>
  );
}
