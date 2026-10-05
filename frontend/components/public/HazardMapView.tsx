"use client";

import { Sunrise } from "lucide-react";
import { useMemo, useState } from "react";
import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";
import { dict, type Locale } from "@/lib/i18n";
import { buildMockPoints, type MockPoint, type PointType } from "@/lib/mock-map";
import type { Hotspot } from "@/lib/public-api";

type Filter = "all" | "hazard" | "crossing";

// Colors are inline hex so they always render, whatever Tailwind has compiled.
const COLOR: Record<PointType, string> = {
  hazard: "#b91c1c",
  crossing: "#059669",
  lit: "#059669",
};

function Dot({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      className={`size-2.5 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}

export default function HazardMapView({
  hotspots,
  locale,
}: {
  hotspots: Hotspot[];
  locale: Locale;
}) {
  const t = dict[locale].map;
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allPoints = useMemo(() => buildMockPoints(hotspots), [hotspots]);
  const count = (type: PointType) => allPoints.filter((p) => p.type === type).length;

  const visible = useMemo(
    () => (filter === "all" ? allPoints : allPoints.filter((p) => p.type === filter)),
    [allPoints, filter],
  );

  // If the selected pin is hidden by the filter, fall back to the first visible one.
  const selected: MockPoint | undefined =
    visible.find((p) => p.id === selectedId) ?? visible[0];

  function messageFor(p: MockPoint) {
    if (p.type === "hazard") return t.messages.hazards[p.messageIndex % t.messages.hazards.length];
    return t.messages[p.type];
  }

  const chips: { key: Filter; label: string; n: number; dot?: string }[] = [
    { key: "all", label: t.all, n: allPoints.length },
    { key: "hazard", label: t.chips.hazard, n: count("hazard"), dot: COLOR.hazard },
    { key: "crossing", label: t.chips.crossing, n: count("crossing"), dot: COLOR.crossing },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.filters}>
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-blue-600 ${
                active ? "bg-blue-600 text-white" : "bg-indigo-50 text-slate-800 hover:bg-indigo-100"
              }`}
            >
              {c.dot && <Dot color={c.dot} />}
              {c.label} ({c.n})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <HazardHeatMapLoader
            key={filter}
            points={visible}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
          {selected && (
            <div className="flex items-start justify-between gap-3 border-t p-4">
              <div>
                <p className="font-semibold">{selected.name}</p>
                <p className="mt-1 flex items-start gap-2 text-sm text-slate-600">
                  <Dot color={COLOR[selected.type]} className="mt-1.5" />
                  {messageFor(selected)}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {t.sample}
              </span>
            </div>
          )}
        </div>

        <div>
          <section className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            {/* Fixed square box, icon centered inside it */}
            <span
              className="flex shrink-0 items-center justify-center rounded-xl bg-indigo-50"
              style={{ width: 56, height: 56, color: "#047857" }}
            >
              <Sunrise className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-semibold">{t.nightTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.nightBody}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
