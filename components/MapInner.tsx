"use client";

// Inner Leaflet map — loaded with ssr:false by PropertyMap because Leaflet
// touches `window` at import time. Uses OpenStreetMap tiles (no API key).

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_CENTER, DEFAULT_ZOOM, STATUS_COLORS, type PropertyT } from "@/lib/lead-types";

function pinIcon(status: string) {
  const color = STATUS_COLORS[status] ?? "#f59e0b";
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapInner({
  properties,
  onPick,
  onSelect,
}: {
  properties: PropertyT[];
  onPick: (lat: number, lng: number) => void;
  onSelect: (property: PropertyT) => void;
}) {
  const mapped = properties.filter((p) => p.lat != null && p.lng != null);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%", minHeight: 420 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {mapped.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat as number, p.lng as number]}
          icon={pinIcon(p.status)}
          eventHandlers={{ click: () => onSelect(p) }}
        />
      ))}
    </MapContainer>
  );
}
