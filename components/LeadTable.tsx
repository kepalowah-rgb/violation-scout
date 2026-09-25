"use client";

// Spreadsheet-style lead log. Status/priority edit inline; CSV export dumps
// the log for Excel/Google Sheets.

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PROPERTY_STATUSES, PROPERTY_PRIORITIES, type PropertyT } from "@/lib/lead-types";

const cellCls = "border border-stone-200 px-2 py-1.5 text-sm";
const selectCls = "w-full rounded border border-stone-300 bg-white px-1 py-1 text-xs";

const PRIORITY_KEYS: Record<string, string> = {
  low: "priorityLow",
  medium: "priorityMedium",
  high: "priorityHigh",
};

function toCsv(properties: PropertyT[]): string {
  const header = ["Address", "City", "ZIP", "TMK", "Status", "Priority", "FollowUp", "Owner", "DistressNotes", "SuspectedViolations", "VirtualTourUrl", "Lat", "Lng"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = properties.map((p) => [
    p.address, p.city, p.zip, p.tmk, p.status, p.priority,
    p.followUpDate ? p.followUpDate.slice(0, 10) : "",
    p.ownerName, p.distressNotes, p.suspectedViolations, p.virtualTourUrl, p.lat, p.lng,
  ].map(esc).join(","));
  return [header.join(","), ...rows].join("\n");
}

export default function LeadTable({
  properties,
  onUpdate,
  onDelete,
  onResearch,
  onEdit,
}: {
  properties: PropertyT[];
  onUpdate: (id: string, patch: Partial<PropertyT>) => void;
  onDelete: (id: string) => void;
  onResearch: (p: PropertyT) => void;
  onEdit: (p: PropertyT) => void;
}) {
  const t = useTranslations("leadTable");
  const ts = useTranslations("status");

  function exportCsv() {
    const blob = new Blob([toCsv(properties)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "driving-for-dollars-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
        {t("empty")}{" "}
        <Link href="/help#lead-log" className="font-medium text-emerald-700 hover:underline">
          {t("emptyGuide")}
        </Link>
      </div>
    );
  }

  const headers = [
    t("headers.address"),
    t("headers.status"),
    t("headers.priority"),
    t("headers.followUp"),
    t("headers.owner"),
    t("headers.actions"),
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={exportCsv}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-100">
          {t("exportCsv")}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full border-collapse bg-white text-left">
          <thead>
            <tr className="bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
              {headers.map((h) => (
                <th key={h} className={cellCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className={cellCls}>
                  <div className="font-medium">{p.address}</div>
                  <div className="text-xs text-stone-500">{p.city} {p.zip ?? ""}</div>
                </td>
                <td className={cellCls}>
                  <select className={selectCls} value={p.status}
                    onChange={(e) => onUpdate(p.id, { status: e.target.value })}>
                    {PROPERTY_STATUSES.map((s) => (
                      <option key={s} value={s}>{ts(s as "new")}</option>
                    ))}
                  </select>
                </td>
                <td className={cellCls}>
                  <select className={selectCls} value={p.priority}
                    onChange={(e) => onUpdate(p.id, { priority: e.target.value })}>
                    {PROPERTY_PRIORITIES.map((pr) => (
                      <option key={pr} value={pr}>{ts(PRIORITY_KEYS[pr] as "priorityLow")}</option>
                    ))}
                  </select>
                </td>
                <td className={cellCls}>
                  <input type="date" className={selectCls}
                    value={p.followUpDate ? p.followUpDate.slice(0, 10) : ""}
                    onChange={(e) => onUpdate(p.id, { followUpDate: e.target.value || null })} />
                </td>
                <td className={cellCls}>{p.ownerName ?? <span className="text-stone-400">{t("noOwner")}</span>}</td>
                <td className={cellCls}>
                  <div className="flex gap-1 text-xs">
                    <button onClick={() => onResearch(p)} className="rounded bg-emerald-100 px-2 py-1 text-emerald-800 hover:bg-emerald-200">{t("research")}</button>
                    <button onClick={() => onEdit(p)} className="rounded bg-stone-100 px-2 py-1 hover:bg-stone-200">{t("edit")}</button>
                    <button onClick={() => { if (confirm(t("deleteConfirm"))) onDelete(p.id); }}
                      className="rounded bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100">{t("delete")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
