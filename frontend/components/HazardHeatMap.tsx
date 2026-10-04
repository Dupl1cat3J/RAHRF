"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export type MapHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  incidents: number;
  riskScore: number;
  riskLevel: number; // 1 = Low, 2 = Medium, 3 = High
};

const COLOR: Record<number, string> = { 3: "#dc2626", 2: "#f59e0b", 1: "#059669" };
const RADIUS_M: Record<number, number> = { 3: 140, 2: 100, 1: 70 };
const PSU_HATYAI: [number, number] = [7.0086, 100.4967];

export default function HazardHeatMap({
  hotspots,
  popup,
}: {
  hotspots: MapHotspot[];
  /** Optional second line in the popup (the page passes translated text). */
  popup?: (h: MapHotspot) => string;
}) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;

    const map = L.map(el.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const group = L.featureGroup();
    for (const h of hotspots) {
      const color = COLOR[h.riskLevel] ?? "#6b7280";

      // Soft halo = the "heat" around the point
      L.circle([h.lat, h.lng], {
        radius: RADIUS_M[h.riskLevel] ?? 70,
        weight: 0,
        fillColor: color,
        fillOpacity: 0.25,
      }).addTo(group);

      // Solid dot with a popup
      const box = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = h.name;
      const detail = document.createElement("div");
      detail.textContent = popup ? popup(h) : `${h.incidents} incidents`;
      box.append(title, detail);

      L.circleMarker([h.lat, h.lng], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      })
        .bindPopup(box)
        .addTo(group);
    }
    group.addTo(map);

    if (hotspots.length > 0) {
      // Build bounds from the coordinates, not from group.getBounds():
      // circles can't report bounds before the map has a view.
      const bounds = L.latLngBounds(hotspots.map((h) => [h.lat, h.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.3), { maxZoom: 17 });
    } else {
      map.setView(PSU_HATYAI, 15);
    }

    return () => {
      map.remove();
    };
  }, [hotspots, popup]);

  return <div ref={el} className="isolate h-[480px] w-full rounded-xl" />;
}
