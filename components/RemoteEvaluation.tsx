"use client";

// Remote evaluation for a property: photo gallery (Vercel Blob) with
// captions, deletion and a lightbox; the saved virtual-tour link; and the
// persisted remote condition checklist (roof … utilities).
//
// Photo uploads are disabled gracefully when the site owner hasn't set
// BLOB_READ_WRITE_TOKEN (/api/photos/config -> enabled: false): the section
// shows an explanatory note instead of a broken upload button.

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CONDITION_ITEM_KEYS,
  type ConditionItemT,
  type ConditionStatus,
  type PropertyPhotoT,
  type PropertyT,
} from "@/lib/lead-types";

const CONDITION_STATUSES: ConditionStatus[] = ["unchecked", "good", "fair", "poor"];
const MAX_MB = 8;
const MAX_PHOTOS = 12;

function statusDot(status: ConditionStatus): string {
  switch (status) {
    case "good":
      return "bg-emerald-500";
    case "fair":
      return "bg-amber-500";
    case "poor":
      return "bg-red-500";
    default:
      return "bg-stone-300";
  }
}

export default function RemoteEvaluation({
  property,
  onPhotosChange,
  onConditionsChange,
}: {
  property: PropertyT;
  onPhotosChange: (photos: PropertyPhotoT[]) => void;
  onConditionsChange: (items: ConditionItemT[]) => void;
}) {
  const t = useTranslations("remote");
  const [blobEnabled, setBlobEnabled] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Condition report local state, seeded from the persisted items.
  // Seeded during render (not in an effect) using the "adjust state during
  // render" pattern: when a different property's saved items arrive, reset
  // the editable copy once.
  const [conditions, setConditions] = useState<Record<string, { status: ConditionStatus; notes: string }>>({});
  const [condSaving, setCondSaving] = useState(false);
  const [condSaved, setCondSaved] = useState(false);
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = `${property.id}:${property.conditionItems.length}`;

  function seedConditions(): Record<string, { status: ConditionStatus; notes: string }> {
    const seeded: Record<string, { status: ConditionStatus; notes: string }> = {};
    for (const key of CONDITION_ITEM_KEYS) {
      const saved = property.conditionItems.find((c) => c.itemKey === key);
      seeded[key] = { status: saved?.status ?? "unchecked", notes: saved?.notes ?? "" };
    }
    return seeded;
  }
  if (seededFor !== seedKey) {
    setSeededFor(seedKey);
    setConditions(seedConditions());
    setCondSaved(false);
  }

  useEffect(() => {
    fetch("/api/photos/config")
      .then((r) => r.json())
      .then((b) => setBlobEnabled(!!b.enabled))
      .catch(() => setBlobEnabled(false));
  }, []);

  function uploadErrorFor(code: string): string {
    switch (code) {
      case "photo_limit":
        return t("uploadErrorCount", { max: MAX_PHOTOS });
      case "photo_type":
        return t("uploadErrorType");
      case "photo_size":
        return t("uploadErrorSize", { max: MAX_MB });
      case "blob_unavailable":
        return t("notConfigured");
      default:
        return t("uploadErrorGeneric");
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      for (const f of Array.from(files)) form.append("photos", f);
      const res = await fetch(`/api/properties/${property.id}/photos`, { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "upload_failed");
      onPhotosChange([...property.photos, ...(body.photos as PropertyPhotoT[])]);
    } catch (e) {
      setUploadError(uploadErrorFor(e instanceof Error ? e.message : ""));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deletePhoto(photoId: string) {
    if (!confirm(t("deletePhotoConfirm"))) return;
    await fetch(`/api/properties/${property.id}/photos/${photoId}`, { method: "DELETE" });
    const remaining = property.photos.filter((p) => p.id !== photoId);
    onPhotosChange(remaining);
    setLightbox(null);
  }

  async function saveCaption(photo: PropertyPhotoT) {
    const res = await fetch(`/api/properties/${property.id}/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: captionDraft }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.photo) {
      onPhotosChange(property.photos.map((p) => (p.id === photo.id ? body.photo : p)));
    }
  }

  function openLightbox(i: number) {
    setLightbox(i);
    setCaptionDraft(property.photos[i]?.caption ?? "");
  }

  async function saveConditions() {
    setCondSaving(true);
    setCondSaved(false);
    try {
      const res = await fetch(`/api/properties/${property.id}/conditions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: CONDITION_ITEM_KEYS.map((key) => ({
            itemKey: key,
            status: conditions[key]?.status ?? "unchecked",
            notes: conditions[key]?.notes ?? "",
          })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "save_failed");
      onConditionsChange(body.conditionItems as ConditionItemT[]);
      setCondSaved(true);
    } catch {
      setUploadError(t("conditionSaveFailed"));
    } finally {
      setCondSaving(false);
    }
  }

  const photos = property.photos;
  const lightboxPhoto = lightbox != null ? photos[lightbox] : null;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="text-lg font-semibold">{t("title")}</h3>
      <p className="mt-1 text-sm text-stone-500">{t("sub")}</p>

      {/* Virtual tour link */}
      <div className="mt-4">
        <p className="text-sm font-medium">{t("tourTitle")}</p>
        {property.virtualTourUrl ? (
          <a
            href={property.virtualTourUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            {t("tourOpen")}
          </a>
        ) : (
          <p className="mt-1 text-sm text-stone-500">{t("tourNone")}</p>
        )}
      </div>

      {/* Photos */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{t("photosTitle")}</p>
          <p className="text-xs text-stone-500">{t("maxPhotos", { max: MAX_PHOTOS })}</p>
        </div>

        {blobEnabled === false ? (
          <p className="mt-2 rounded-lg bg-stone-100 p-3 text-xs text-stone-600">{t("notConfigured")}</p>
        ) : photos.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">{t("noPhotos")}</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => openLightbox(i)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100"
                title={t("viewLarger")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption || property.address}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
                {p.caption && (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-left text-[11px] text-white">
                    {p.caption}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {blobEnabled !== false && (
          <div className="mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || blobEnabled === null}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 disabled:opacity-50"
            >
              {uploading ? t("uploading") : t("upload")}
            </button>
            {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
          </div>
        )}
      </div>

      {/* Condition report */}
      <div className="mt-6 border-t border-stone-100 pt-4">
        <p className="text-sm font-medium">{t("conditionTitle")}</p>
        <p className="mt-1 text-xs text-stone-500">{t("conditionSub")}</p>
        <div className="mt-3 space-y-3">
          {CONDITION_ITEM_KEYS.map((key) => (
            <div key={key} className="rounded-lg border border-stone-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusDot(conditions[key]?.status ?? "unchecked")}`} />
                  {t(`items.${key}` as "items.roof")}
                </p>
                <select
                  value={conditions[key]?.status ?? "unchecked"}
                  onChange={(e) =>
                    setConditions({
                      ...conditions,
                      [key]: { ...conditions[key], status: e.target.value as ConditionStatus },
                    })
                  }
                  className="rounded border border-stone-300 px-2 py-1 text-xs"
                >
                  {CONDITION_STATUSES.map((s) => (
                    <option key={s} value={s}>{t(`status.${s}` as "status.unchecked")}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={conditions[key]?.notes ?? ""}
                onChange={(e) =>
                  setConditions({
                    ...conditions,
                    [key]: { ...conditions[key], notes: e.target.value },
                  })
                }
                placeholder={t("notesPlaceholder")}
                rows={2}
                className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={saveConditions}
            disabled={condSaving}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {condSaving ? t("conditionSaving") : t("conditionSave")}
          </button>
          {condSaved && <p className="text-sm text-emerald-700">{t("conditionSaved")}</p>}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="w-full max-w-3xl rounded-xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxPhoto.url} alt={lightboxPhoto.caption || property.address} className="max-h-[70vh] w-full rounded-lg object-contain bg-stone-100" />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => openLightbox((lightbox! + photos.length - 1) % photos.length)}
                className="rounded border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100"
                aria-label="←"
              >
                ←
              </button>
              <button
                onClick={() => openLightbox((lightbox! + 1) % photos.length)}
                className="rounded border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100"
                aria-label="→"
              >
                →
              </button>
              <span className="ml-auto text-xs text-stone-500">
                {lightbox! + 1} / {photos.length}
              </span>
              <button onClick={() => setLightbox(null)} className="rounded border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100">
                {t("close")}
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={captionDraft}
                onChange={(e) => setCaptionDraft(e.target.value)}
                placeholder={t("captionPlaceholder")}
                maxLength={200}
                onBlur={() => saveCaption(lightboxPhoto)}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
              <button
                onClick={() => deletePhoto(lightboxPhoto.id)}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
              >
                {t("deletePhoto")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
