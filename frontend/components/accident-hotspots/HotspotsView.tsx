"use client";

import { Droplets, MapPin, Moon, ShieldCheck, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";
import { HOTSPOT_LOG, hotspotsText } from "@/lib/hotspots-content";
import type { Locale } from "@/lib/i18n";
import type { Hotspot } from "@/lib/public-api";

type FilterKey = "weather" | "surface" | "lighting" | "severity";

const LEVEL: Record<number, { pill: string; text: string; hex: string }> = {
  3: { pill: "bg-red-100 text-red-700", text: "text-red-700", hex: "#dc2626" },
  2: { pill: "bg-orange-100 text-orange-700", text: "text-orange-700", hex: "#f97316" },
  1: { pill: "bg-blue-100 text-blue-700", text: "text-blue-700", hex: "#3b82f6" },
};

const tag = (l: Locale) => (l === "th" ? "th-TH" : "en-GB");
const fmtShort = (d: Date, l: Locale) =>
  new Intl.DateTimeFormat(tag(l), { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }).format(d);
const fmtFull = (d: string, l: Locale) =>
  new Intl.DateTimeFormat(tag(l), {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Bangkok",
  }).format(new Date(d));

function Dot({ color, className = "" }: { color: string; className?: string }) {
  return <span className={`inline-block size-2.5 shrink-0 rounded-full ${className}`} style={{ backgroundColor: color }} />;
}

function Panel({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">{children}</section>;
}

// Sample tags: the top-ranked spots match every filter so the default view is not empty.
function matches(h: Hotspot, rank: number, f: FilterKey) {
  if (f === "weather") return rank < 4;
  if (f === "surface") return rank < 5;
  if (f === "lighting") return rank !== 3;
  return h.riskLevel === 3;
}

export default function HotspotsView({
  locale,
  hotspots,
  baseIso,
}: {
  locale: Locale;
  hotspots: Hotspot[];
  baseIso: string;
}) {
  const t = hotspotsText[locale];
  const [on, setOn] = useState<Record<FilterKey, boolean>>({ weather: true, surface: true, lighting: true, severity: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const ranked = useMemo(() => [...hotspots].sort((a, b) => b.riskScore - a.riskScore), [hotspots]);
  const visible = useMemo(
    () => ranked.filter((h, i) => (Object.keys(on) as FilterKey[]).every((f) => !on[f] || matches(h, i, f))),
    [ranked, on],
  );
  const sel = visible.find((h) => h.id === selected) ?? visible[0];
  const rank = sel ? ranked.indexOf(sel) + 1 : 0;
  const lvlText = (l: number) => (l === 3 ? t.high : l === 2 ? t.medium : t.low);
  const activeSeverity = ranked.filter((h) => h.riskLevel === 3).length;

  const chips: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
    { key: "weather", label: t.weather, icon: <Droplets className="size-4" aria-hidden /> },
    { key: "surface", label: t.surface, icon: <SlidersHorizontal className="size-4" aria-hidden /> },
    { key: "lighting", label: t.lighting, icon: <Moon className="size-4" aria-hidden /> },
    { key: "severity", label: t.severity(activeSeverity), icon: <TriangleAlert className="size-4" aria-hidden /> },
  ];

  const start = new Date(baseIso).getTime() + 86400000;
  const period = `${fmtShort(new Date(start), locale)} – ${fmtShort(new Date(start + 30 * 86400000), locale)}`;
  const mapKey = visible.map((h) => h.id).join("|");

  return (
    <div className="space-y-6">
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-3 shadow-md ring-1 ring-slate-200 lg:rounded-full">
        <span className="flex items-center gap-2 px-3 text-sm font-medium text-slate-600">
          <SlidersHorizontal className="size-4" aria-hidden />
          {t.activeFilter}
        </span>
        {chips.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={on[f.key]}
            onClick={() => setOn((s) => ({ ...s, [f.key]: !s[f.key] }))}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              on[f.key] ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">{t.secB}</p>
            <h2 className="text-2xl font-bold">{t.title}</h2>
          </div>
          <div className="flex items-center gap-4 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium">
            <span>{t.legend}</span>
            <span className="flex items-center gap-1.5"><Dot color="#b91c1c" />{t.critical}</span>
            <span className="flex items-center gap-1.5"><Dot color="#f97316" />{t.high}</span>
            <span className="flex items-center gap-1.5"><Dot color="#eab308" />{t.medium}</span>
            <span className="flex items-center gap-1.5"><Dot color="#059669" />{t.low}</span>
          </div>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-xl">
          <HazardHeatMapLoader key={mapKey} hotspots={visible} onSelectHotspot={setSelected} height={640} />
          {visible.length === 0 && (
            <p className="absolute inset-x-4 top-4 z-10 rounded-lg bg-white/95 p-3 text-sm text-slate-700 shadow">{t.empty}</p>
          )}
          {sel && (
            <div className="pointer-events-none absolute left-4 top-4 z-10 w-72 max-w-[calc(100%-2rem)] rounded-xl bg-white/95 p-4 text-sm shadow-lg ring-1 ring-slate-200 lg:left-auto lg:right-6 lg:top-16">
              <p className={`text-xs font-bold ${LEVEL[sel.riskLevel]?.text ?? ""}`}>● {t.hotspotNo(rank, lvlText(sel.riskLevel))}</p>
              <p className="mt-1 text-lg font-bold leading-tight">{sel.name}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className={`rounded px-2 py-0.5 ${LEVEL[sel.riskLevel]?.pill ?? ""}`}>{t.riskScore(sel.riskScore)}</span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-blue-700">{t.confidence((96.8 - (rank - 1) * 0.7).toFixed(1))}</span>
              </div>
              <p className="mt-2 text-xs font-semibold">{t.predictedPeriod}</p>
              <p className="text-xs text-slate-600">{period}</p>
              <p className="text-xs text-slate-600">{sel.lat.toFixed(4)}°N {sel.lng.toFixed(4)}°E</p>
              <div className="mt-2 rounded-lg bg-slate-50 p-2.5">
                <p className="text-[11px] font-bold">{t.keyFactors}</p>
                <ul className="mt-1 space-y-1 text-[11px] text-slate-700">
                  {t.factors.map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {sel && (
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-3 text-3xl font-bold">
                <Dot color={LEVEL[sel.riskLevel]?.hex ?? "#6b7280"} className="size-3" />
                {t.cluster(rank)}
              </h2>
              <p className="mt-3 text-2xl font-semibold">{sel.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="size-4" aria-hidden />
                {sel.lat.toFixed(4)}° N, {sel.lng.toFixed(4)}° E • {t.sector}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${LEVEL[sel.riskLevel]?.pill ?? ""}`}>
              {lvlText(sel.riskLevel).toUpperCase()} ({sel.riskScore})
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-600">{t.totalIncidents}</p>
              <p className="text-3xl font-bold">{sel.incidents} <span className="text-xs font-semibold text-red-600">{t.vsQ2(Math.max(1, Math.round(sel.incidents * 0.2)))}</span></p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-600">{t.casualties}</p>
              <p className="text-3xl font-bold">{Math.max(1, Math.round(sel.incidents * 0.4))} <span className="text-xs font-semibold text-slate-600">{t.casualtiesNote(0, Math.max(1, Math.round(sel.incidents * 0.17)))}</span></p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-600">{t.vector}</p>
              <p className="font-bold">{t.vectorValue}</p>
              <p className="text-xs text-blue-600">{t.recorded(61)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-600">{t.env}</p>
              <p className="font-bold">72% {t.envValue}</p>
              <p className="text-xs text-slate-600">{t.envNote(58)}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wide">
              {t.log}
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{t.sample}</span>
            </p>
            <span className="text-xs font-semibold text-blue-600">{t.viewTotal(sel.incidents)}</span>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {HOTSPOT_LOG.map((l) => (
              <div key={l.id} className="rounded-lg bg-slate-50 px-4 py-2.5 text-sm">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-red-600">{l.id}</span>
                  <span className="text-slate-500">{fmtFull(l.when, locale)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span>{t.vehiclePairs[l.pair]}</span>
                  <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${l.injury === "mod" ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"}`}>
                    {t.injuries[l.injury]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid items-center gap-3 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-wide">
                <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
                {t.recommended}
              </p>
              <p className="mt-1 text-sm text-slate-700">{t.recommendedText}</p>
            </div>
            <div>
              <button type="button" onClick={() => setSent(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                <ShieldCheck className="size-5" aria-hidden />
                {t.deploy}
              </button>
              {sent && <p className="mt-2 text-center text-xs text-slate-600">{t.deployed}</p>}
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
