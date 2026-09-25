"use client";

// Dashboard shell: four tabs (Map, Leads, Research, Contracts) over the user's
// data. All mutations go through the /api routes; this component owns the
// client-side state and refreshes it after each change.

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import PropertyMap from "./PropertyMap";
import PropertyForm, { type PropertyFormValues } from "./PropertyForm";
import LeadTable from "./LeadTable";
import ResearchChecklist from "./ResearchChecklist";
import ContractBuilder, { type ContractFormValues } from "./ContractBuilder";
import { ATTORNEY } from "@/config/attorney";
import type { PropertyT, ContractT, ResearchItemT } from "@/lib/lead-types";

type Tab = "map" | "leads" | "research" | "contracts";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="mt-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-900">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DashboardClient({
  initialProperties,
  initialContracts,
}: {
  initialProperties: PropertyT[];
  initialContracts: ContractT[];
}) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("dashboard.contracts");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("map");
  const [properties, setProperties] = useState<PropertyT[]>(initialProperties);
  const [contracts, setContracts] = useState<ContractT[]>(initialContracts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [editingProperty, setEditingProperty] = useState<PropertyT | null | undefined>(undefined);
  const [editingContract, setEditingContract] = useState<ContractT | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  // Attorney review: which draft the confirmation modal is open for, plus
  // whether this is a re-send of an already-requested review.
  const [reviewContract, setReviewContract] = useState<{ c: ContractT; resend: boolean } | null>(null);
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const selected = properties.find((p) => p.id === selectedId) ?? null;
  const usd = (n: number) => n.toLocaleString(locale, { style: "currency", currency: "USD" });

  async function refreshProperties() {
    const { properties } = await api("/api/properties");
    setProperties(properties);
    return properties as PropertyT[];
  }
  async function refreshContracts() {
    const { contracts } = await api("/api/contracts");
    setContracts(contracts);
  }

  // ---- properties ----
  async function saveProperty(values: PropertyFormValues) {
    setSaving(true);
    try {
      if (editingProperty) {
        await api(`/api/properties/${editingProperty.id}`, { method: "PATCH", body: JSON.stringify(values) });
      } else {
        await api("/api/properties", { method: "POST", body: JSON.stringify(values) });
      }
      await refreshProperties();
      setEditingProperty(undefined);
      setPicked(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function updateProperty(id: string, patch: Partial<PropertyT>) {
    const prev = properties;
    setProperties(properties.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    try {
      await api(`/api/properties/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    } catch {
      setProperties(prev);
    }
  }

  async function deleteProperty(id: string) {
    await api(`/api/properties/${id}`, { method: "DELETE" });
    setProperties(properties.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  // ---- research items ----
  async function refreshSelected() {
    const list = await refreshProperties();
    return list.find((p: PropertyT) => p.id === selectedId) ?? null;
  }

  async function updateItem(itemId: string, patch: Partial<ResearchItemT>) {
    if (!selected) return;
    const prev = properties;
    setProperties(properties.map((p) =>
      p.id === selected.id
        ? { ...p, researchItems: p.researchItems.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
        : p
    ));
    try {
      await api(`/api/research-items/${itemId}`, { method: "PATCH", body: JSON.stringify(patch) });
    } catch {
      setProperties(prev);
    }
  }

  async function deleteItem(itemId: string) {
    await api(`/api/research-items/${itemId}`, { method: "DELETE" });
    await refreshSelected();
  }

  async function addItem(propertyId: string, label: string) {
    await api("/api/research-items", { method: "POST", body: JSON.stringify({ propertyId, label }) });
    await refreshSelected();
  }

  // ---- contracts ----
  async function saveContract(values: ContractFormValues) {
    setSaving(true);
    try {
      const payload = {
        propertyId: values.propertyId || null,
        template: values.template === "generic" ? "generic" : "hawaii",
        sellerName: values.sellerName,
        propertyAddress: values.propertyAddress,
        tmk: values.tmk || null,
        purchasePrice: Number(values.purchasePrice),
        earnestMoney: Number(values.earnestMoney || 0),
        assignmentFee: Number(values.assignmentFee || 0),
        closingDate: values.closingDate || null,
        inspectionDays: Number(values.inspectionDays || 10),
        additionalTerms: values.additionalTerms || null,
      };
      if (editingContract) {
        await api(`/api/contracts/${editingContract.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/api/contracts", { method: "POST", body: JSON.stringify(payload) });
      }
      await refreshContracts();
      setEditingContract(undefined);
    } catch (e) {
      alert(e instanceof Error ? e.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteContract(id: string) {
    if (!confirm(tc("deleteConfirm"))) return;
    await api(`/api/contracts/${id}`, { method: "DELETE" });
    setContracts(contracts.filter((c) => c.id !== id));
  }

  // ---- attorney review ----
  async function sendReviewRequest() {
    if (!reviewContract) return;
    setReviewSending(true);
    setReviewError(null);
    try {
      const { contract } = await api(`/api/contracts/${reviewContract.c.id}/request-review`, {
        method: "POST",
        body: JSON.stringify({ resend: reviewContract.resend, locale }),
      });
      setContracts(contracts.map((c) => (c.id === contract.id ? contract : c)));
      setReviewContract(null);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : tc("reviewErrorFallback"));
    } finally {
      setReviewSending(false);
    }
  }

  function formatReviewDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "map", label: t("tabs.map") },
    { id: "leads", label: t("tabs.leads", { count: properties.length }) },
    { id: "research", label: t("tabs.research") },
    { id: "contracts", label: t("tabs.contracts", { count: contracts.length }) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-stone-200">
        {tabs.map((tabDef) => (
          <button
            key={tabDef.id}
            onClick={() => setTab(tabDef.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${
              tab === tabDef.id
                ? "border-b-2 border-emerald-700 text-emerald-800"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            {tabDef.label}
          </button>
        ))}
      </div>

      {tab === "map" && (
        <div>
          <p className="mb-3 text-sm text-stone-600">{t("map.hint")}</p>
          {properties.length === 0 && (
            <div className="mb-4 rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">
              {t("map.empty")}{" "}
              <Link href="/help#map-logging" className="font-medium text-emerald-700 hover:underline">
                {t("map.emptyGuide")}
              </Link>
            </div>
          )}
          <PropertyMap
            properties={properties}
            onPick={(lat, lng) => {
              setPicked({ lat, lng });
              setEditingProperty(null);
            }}
            onSelect={(p) => {
              setSelectedId(p.id);
              setTab("research");
            }}
          />
        </div>
      )}

      {tab === "leads" && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setEditingProperty(null)}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {t("leads.add")}
            </button>
          </div>
          <LeadTable
            properties={properties}
            onUpdate={updateProperty}
            onDelete={deleteProperty}
            onResearch={(p) => {
              setSelectedId(p.id);
              setTab("research");
            }}
            onEdit={(p) => setEditingProperty(p)}
          />
        </div>
      )}

      {tab === "research" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {t("research.selectLead")}
            </h3>
            <div className="space-y-1">
              {properties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    p.id === selectedId
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-stone-200 bg-white hover:bg-stone-50"
                  }`}
                >
                  <span className="font-medium">{p.address}</span>
                  <span className="block text-xs text-stone-500">
                    {t("research.stepsDone", {
                      done: p.researchItems.filter((i) => i.status === "done").length,
                      total: p.researchItems.length,
                    })}
                  </span>
                </button>
              ))}
              {properties.length === 0 && (
                <p className="text-sm text-stone-500">
                  {t("research.empty")}{" "}
                  <Link href="/help#research" className="font-medium text-emerald-700 hover:underline">
                    {t("research.emptyGuide")}
                  </Link>
                </p>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            {selected ? (
              <ResearchChecklist
                key={selected.id}
                property={selected}
                onItemUpdate={updateItem}
                onItemDelete={deleteItem}
                onItemAdd={addItem}
                onOwnerSave={(id, ownerName) => updateProperty(id, { ownerName })}
                onPropertyUpdate={updateProperty}
              />
            ) : (
              <p className="text-sm text-stone-500">
                {t("research.selectPrompt")}{" "}
                <Link href="/help#research" className="font-medium text-emerald-700 hover:underline">
                  {t("research.selectGuide")}
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "contracts" && (
        <div>
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
            <strong>{tc("attorneyNoteStrong")}</strong> {tc("attorneyNote")}
          </div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setEditingContract(null)}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {tc("new")}
            </button>
          </div>
          {contracts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              {tc("empty")}{" "}
              <Link href="/help#contracts" className="font-medium text-emerald-700 hover:underline">
                {tc("emptyGuide")}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-sm">
                      {c.propertyAddress}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          c.template === "generic"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.template === "generic" ? tc("templateGeneric") : tc("templateHawaii")}
                      </span>
                    </p>
                    <p className="text-xs text-stone-500">
                      {tc("seller")}: {c.sellerName} · {usd(c.purchasePrice)}
                      {c.assignmentFee ? ` · ${tc("fee")} ${usd(c.assignmentFee)}` : ""}
                    </p>
                    {c.reviewRequestedAt && (
                      <p className="mt-1">
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">
                          ✓ {tc("reviewRequested")} · {formatReviewDate(c.reviewRequestedAt)}
                        </span>{" "}
                        <button
                          onClick={() => setReviewContract({ c, resend: true })}
                          className="text-[11px] font-medium text-violet-700 underline hover:text-violet-900"
                        >
                          {tc("reviewResend")}
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs">
                    {!c.reviewRequestedAt && (
                      <button
                        onClick={() => { setReviewError(null); setReviewContract({ c, resend: false }); }}
                        className="rounded bg-violet-100 px-3 py-1.5 font-medium text-violet-800 hover:bg-violet-200"
                      >
                        {tc("requestReview")}
                      </button>
                    )}
                    <Link
                      href={`/dashboard/contracts/${c.id}/print`}
                      target="_blank"
                      className="rounded bg-emerald-100 px-3 py-1.5 font-medium text-emerald-800 hover:bg-emerald-200"
                    >
                      {tc("previewPrint")}
                    </Link>
                    <button onClick={() => setEditingContract(c)}
                      className="rounded bg-stone-100 px-3 py-1.5 hover:bg-stone-200">{tc("edit")}</button>
                    <button onClick={() => deleteContract(c.id)}
                      className="rounded bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100">{tc("delete")}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingProperty !== undefined && (
        <Modal
          title={editingProperty ? t("propertyModal.edit") : picked ? t("propertyModal.log") : t("propertyModal.add")}
          onClose={() => {
            setEditingProperty(undefined);
            setPicked(null);
          }}
        >
          <PropertyForm
            initial={editingProperty ?? undefined}
            picked={picked}
            saving={saving}
            onSave={saveProperty}
            onCancel={() => {
              setEditingProperty(undefined);
              setPicked(null);
            }}
          />
        </Modal>
      )}

      {reviewContract && (
        <Modal
          title={reviewContract.resend ? tc("reviewResendTitle") : tc("reviewModalTitle")}
          onClose={() => { if (!reviewSending) { setReviewContract(null); setReviewError(null); } }}
        >
          <div className="space-y-4">
            <p className="text-sm text-stone-700">
              {reviewContract.resend
                ? tc("reviewResendBody", { date: formatReviewDate(reviewContract.c.reviewRequestedAt!) })
                : tc("reviewModalBody", { attorney: ATTORNEY.name })}
            </p>
            {!reviewContract.resend && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{tc("reviewModalNote")}</p>
            )}
            {reviewError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{reviewError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={reviewSending}
                onClick={() => { setReviewContract(null); setReviewError(null); }}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100 disabled:opacity-50"
              >
                {tc("reviewCancel")}
              </button>
              <button
                type="button"
                disabled={reviewSending}
                onClick={sendReviewRequest}
                className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {reviewSending ? tc("reviewSending") : reviewContract.resend ? tc("reviewResendConfirm") : tc("reviewConfirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingContract !== undefined && (
        <Modal title={editingContract ? tc("modalEdit") : tc("modalNew")} onClose={() => setEditingContract(undefined)}>
          <ContractBuilder
            initial={editingContract ?? undefined}
            properties={properties}
            presetAddress={selected?.address}
            saving={saving}
            onSave={saveContract}
            onCancel={() => setEditingContract(undefined)}
          />
        </Modal>
      )}
    </div>
  );
}
