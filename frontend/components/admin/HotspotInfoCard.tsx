"use client";
import { Bike, CloudRain, Droplets, Moon } from "lucide-react";

export type HotspotCardData = {
  roadName: string;
  rank: number;
  lat: number;
  lng: number;
  incidents: number;
  riskScore: number;
  riskLevel: number;
  confidence: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  factors: { type: "lighting" | "surface" | "weather" | "vehicle"; label: string; pct: number }[];
};

type Lang = "en" | "th";

const VEHICLES: Record<string, { en: string; th: string }> = {
  Motorcycle: { en: "motorcycles", th: "รถจักรยานยนต์" },
  Car: { en: "cars", th: "รถยนต์" },
  Pedestrian: { en: "pedestrians", th: "คนเดินเท้า" },
  Bicycle: { en: "bicycles", th: "จักรยาน" },
  Bus: { en: "buses", th: "รถโดยสาร" },
};

const T = {
  en: {
    hotspot: "HOTSPOT",
    levels: { 3: "HIGH RISK", 2: "MEDIUM RISK", 1: "LOW RISK" } as Record<number, string>,
    riskScore: "Risk Score",
    confidence: "CONFIDENCE",
    period: "Predicted Period",
    factors: "KEY RISK FACTORS",
    incidents: "incidents recorded",
    lighting: (p: number) => `${p}% of accidents at dusk or night`,
    surface: (p: number) => `${p}% on a wet road surface`,
    weather: (p: number) => `${p}% in rainy weather`,
    vehicle: (p: number, v: string) => `${p}% involve ${v}`,
  },
  th: {
    hotspot: "จุดเสี่ยง",
    levels: { 3: "ความเสี่ยงสูง", 2: "ความเสี่ยงกลาง", 1: "ความเสี่ยงต่ำ" } as Record<number, string>,
    riskScore: "คะแนนความเสี่ยง",
    confidence: "ความเชื่อมั่น",
    period: "ช่วงเวลาที่พยากรณ์",
    factors: "ปัจจัยเสี่ยงหลัก",
    incidents: "ครั้งที่บันทึกไว้",
    lighting: (p: number) => `${p}% ของอุบัติเหตุเกิดช่วงเย็นถึงกลางคืน`,
    surface: (p: number) => `${p}% เกิดบนผิวถนนเปียก`,
    weather: (p: number) => `${p}% เกิดขณะฝนตก`,
    vehicle: (p: number, v: string) => `${p}% เกี่ยวข้องกับ${v}`,
  },
};

const LEVEL: Record<number, { text: string; bg: string; dot: string }> = {
  3: { text: "text-red-700", bg: "bg-red-100", dot: "bg-red-600" },
  2: { text: "text-orange-700", bg: "bg-orange-100", dot: "bg-orange-500" },
  1: { text: "text-blue-700", bg: "bg-blue-100", dot: "bg-blue-500" },
};

function fmt(iso: string | null, lang: Lang) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString(lang === "th" ? "th-TH" : "en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function HotspotInfoCard({ card, lang }: { card: HotspotCardData; lang: Lang }) {
  const tx = T[lang];
  const lv = LEVEL[card.riskLevel] ?? LEVEL[1];

  const factorText = (f: HotspotCardData["factors"][number]) => {
    if (f.type === "lighting") return tx.lighting(f.pct);
    if (f.type === "surface") return tx.surface(f.pct);
    if (f.type === "weather") return tx.weather(f.pct);
    return tx.vehicle(f.pct, VEHICLES[f.label]?.[lang] ?? f.label);
  };
  const Icon = (type: string) =>
    type === "lighting" ? Moon : type === "surface" ? Droplets : type === "weather" ? CloudRain : Bike;

  return (
    <div className="w-[300px] space-y-3 p-4 text-gray-900">
      <div className={`flex items-center gap-2 text-[11px] font-semibold tracking-wide ${lv.text}`}>
        <span className={`h-2 w-2 rounded-full ${lv.dot}`} />
        {tx.hotspot} #{card.rank} · {tx.levels[card.riskLevel]}
      </div>

      <div className="text-lg font-semibold leading-snug">{card.roadName}</div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`rounded-md px-2 py-1 font-medium ${lv.bg} ${lv.text}`}>
          {tx.riskScore}: {card.riskScore} / 100
        </span>
        {card.confidence !== null && (
          <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">
            {tx.confidence}: {card.confidence}%
          </span>
        )}
      </div>

      <div className="space-y-0.5 text-xs">
        <div className="font-semibold">{tx.period}:</div>
        <div className="text-gray-600">
          {fmt(card.periodStart, lang)} - {fmt(card.periodEnd, lang)}
        </div>
        <div className="text-gray-600">
          {card.lat.toFixed(4)}°N {card.lng.toFixed(4)}°E · {card.incidents} {tx.incidents}
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-3 text-xs">
        <div className="mb-2 font-semibold tracking-wide">{tx.factors}</div>
        <ul className="space-y-1.5">
          {card.factors.map((f) => {
            const I = Icon(f.type);
            return (
              <li key={f.type} className="flex items-start gap-2">
                <I className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-700" />
                <span>{factorText(f)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}