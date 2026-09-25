"use client";

// SSR-safe wrapper around the Leaflet map. Next.js renders this shell on the
// server and loads the real map only in the browser.

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { PropertyT } from "@/lib/lead-types";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const t = useTranslations("dashboard");
  return (
    <div className="grid min-h-[420px] place-items-center rounded-xl bg-stone-100 text-sm text-stone-500">
      {t("map.loading")}
    </div>
  );
}

export default function PropertyMap({
  properties,
  onPick,
  onSelect,
}: {
  properties: PropertyT[];
  onPick: (lat: number, lng: number) => void;
  onSelect: (property: PropertyT) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <MapInner properties={properties} onPick={onPick} onSelect={onSelect} />
    </div>
  );
}
