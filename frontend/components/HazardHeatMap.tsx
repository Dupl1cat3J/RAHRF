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

export type MapPin = {
  id: string;
  type: "hazard" | "crossing" | "lit";
  name: string;
  lat: number;
  lng: number;
};

const COLOR: Record<number, string> = { 3: "#dc2626", 2: "#f59e0b", 1: "#059669" };
const RADIUS_M: Record<number, number> = { 3: 140, 2: 100, 1: 70 };
const PSU_HATYAI: [number, number] = [7.0086, 100.4967];

const PIN_BG: Record<MapPin["type"], string> = {
  hazard: "#b91c1c",
  crossing: "#047857",
  lit: "#047857",
};

// Inner shapes of lucide icons (24x24, stroke only)
const PIN_ICON: Record<MapPin["type"], string> = {
  hazard:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  crossing: '<path d="M20 6 9 17l-5-5"/>',
  lit: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
};

function pinIcon(type: MapPin["type"]) {
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="width:34px;height:34px;border-radius:9999px;background:${PIN_BG[type]};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;transition:transform .15s"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${PIN_ICON[type]}</svg></div>`,
  });
}

// Stable defaults so the effect below does not re-run on every render
const NO_HOTSPOTS: MapHotspot[] = [];
const NO_PINS: MapPin[] = [];

export default function HazardHeatMap({
  hotspots = NO_HOTSPOTS,
  points = NO_PINS,
  onSelect,
  selectedId,
  popup,
  onSelectHotspot,
  heightClass = "h-[480px]",
  height,
}: {
  /** Risk halos with a popup (used by the admin dashboard). */
  hotspots?: MapHotspot[];
  /** Icon pins (used by the public hazard map). */
  points?: MapPin[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  popup?: (h: MapHotspot) => string;
  /** If given, clicking a halo dot calls this instead of opening a popup. */
  onSelectHotspot?: (id: string) => void;
  heightClass?: string;
  /** Pixel height. If given, it wins over heightClass (inline style, always applied). */
  height?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);
  const onHotspotRef = useRef(onSelectHotspot);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onHotspotRef.current = onSelectHotspot;
  }, [onSelect, onSelectHotspot]);

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

      const box = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = h.name;
      const detail = document.createElement("div");
      detail.textContent = popup ? popup(h) : `${h.incidents} incidents`;
      box.append(title, detail);

      const dot = L.circleMarker([h.lat, h.lng], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      });
      if (onHotspotRef.current) {
        dot.on("click", () => onHotspotRef.current?.(h.id));
      } else {
        dot.bindPopup(box);
      }
      dot.addTo(group);
    }

    for (const p of points) {
      const m = L.marker([p.lat, p.lng], {
        icon: pinIcon(p.type),
        title: p.name,
        riseOnHover: true,
      });
      m.on("click", () => onSelectRef.current?.(p.id));
      m.addTo(group);
      markers.current.set(p.id, m);
    }

    group.addTo(map);

    const coords: [number, number][] = [
      ...hotspots.map((h) => [h.lat, h.lng] as [number, number]),
      ...points.map((p) => [p.lat, p.lng] as [number, number]),
    ];
    if (coords.length > 0) {
      // Bounds from coordinates (not group.getBounds()): circles cannot report
      // bounds before the map has a view.
      map.fitBounds(L.latLngBounds(coords).pad(0.3), { maxZoom: 17 });
    } else {
      map.setView(PSU_HATYAI, 15);
    }

    const stored = markers.current;
    return () => {
      stored.clear();
      map.remove();
    };
  }, [hotspots, points, popup]);

  // Enlarge the selected pin
  useEffect(() => {
    markers.current.forEach((m, id) => {
      const inner = m.getElement()?.firstElementChild as HTMLElement | null;
      if (inner) inner.style.transform = id === selectedId ? "scale(1.3)" : "";
      m.setZIndexOffset(id === selectedId ? 1000 : 0);
    });
  }, [selectedId, points, hotspots]);

  return (
    <div
      ref={el}
      className={`isolate w-full rounded-xl ${height ? "" : heightClass}`}
      style={height ? { height } : undefined}
    />
  );
}
