"use client";

import { useMemo, useState } from "react";
import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";
import { dict, type Locale } from "@/lib/i18n";
import type { Hotspot } from "@/lib/public-api";

type Filter = "all" | 1 | 2 | 3;

const STYLE: Record<number, { dot: string; badge: string }> = {
  3: { dot: "bg-red-600", badge: "bg-red-100 text-red-700" },
  2: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800" },
  1: { dot: "bg-emerald-600", badge: "bg-emerald-100 text-emerald-800" },
};

export default function HazardMapView({
  hotspots,
  locale,
}: {
  hotspots: Hotspot[];
  locale: Locale;
}) {
  const t = dict[locale].map;
  const [filter, setFilter] = useState<Filter>("all");

  const count = (lvl: number) => hotspots.filter((h) => h.riskLevel === lvl).length;

  const visible = useMemo(
    () => (filter === "all" ? hotspots : hotspots.filter((h) => h.riskLevel === filter)),
    [hotspots, filter],
  );
  const ranked = useMemo(
    () => [...visible].sort((a, b) => b.riskScore - a.riskScore),
    [visible],
  );
  const top = ranked[0];

  const chips: { key: Filter; label: string; n: number; dot?: string }[] = [
    { key: "all", label: t.all, n: hotspots.length },
    { key: 3, label: t.filter[3], n: count(3), dot: STYLE[3].dot },
    { key: 2, label: t.filter[2], n: count(2), dot: STYLE[2].dot },
    { key: 1, label: t.filter[1], n: count(1), dot: STYLE[1].dot },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.filters}>
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={String(c.key)}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${
                active ? "bg-blue-600 text-white" : "bg-indigo-50 text-slate-800 hover:bg-indigo-100"
              }`}
            >
              {c.dot && <span className={`size-2.5 rounded-full ${c.dot}`} />}
              {c.label} ({c.n})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <HazardHeatMapLoader
              key={String(filter)}
              hotspots={visible}
              popup={(h) =>
                `${t.incidents(h.incidents)} · ${t.levels[h.riskLevel] ?? "-"} (${h.riskScore})`
              }
            />
            {top && (
              <div className="border-t p-4">
                <p className="font-semibold">{top.name}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <span className={`size-2.5 shrink-0 rounded-full ${STYLE[top.riskLevel]?.dot ?? "bg-slate-400"}`} />
                  {t.topLine(top.incidents, top.riskScore)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-2xl bg-white p-3 text-sm font-semibold shadow-sm ring-1 ring-slate-200">
            {[3, 2, 1].map((l) => (
              <span key={l} className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${STYLE[l].dot}`} />
                {t.filter[l]}
              </span>
            ))}
          </div>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">{t.watchTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.watchDesc}</p>
          {ranked.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">{t.empty}</p>
          ) : (
            <ul className="mt-4 divide-y">
              {ranked.slice(0, 8).map((h) => (
                <li key={h.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-xs text-slate-500">{t.incidents(h.incidents)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLE[h.riskLevel]?.badge ?? ""}`}>
                    {t.levels[h.riskLevel] ?? "-"} ({h.riskScore})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
