import { dict, type Locale } from "@/lib/i18n";

const COLORS = ["#2563eb", "#dc2626", "#f59e0b", "#7c3aed", "#6b7280", "#0d9488"];

export default function VehicleDonut({
  vehicles,
  locale,
}: {
  vehicles: { vehicle: string; accidents: number }[];
  locale: Locale;
}) {
  const t = dict[locale].stats;
  const total = vehicles.reduce((a, v) => a + v.accidents, 0);
  if (total === 0) return <p className="text-sm text-slate-600">{t.noData}</p>;

  // Circumference = 100, so each value maps directly to a percentage.
  let offset = 25; // start at 12 o'clock
  const arcs = vehicles.map((v, i) => {
    const pct = (v.accidents / total) * 100;
    const arc = { ...v, pct, color: COLORS[i % COLORS.length], offset };
    offset -= pct;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative size-44 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full" role="img" aria-label={t.vehicleAria}>
          <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="5" />
          {arcs.map((a) => (
            <circle
              key={a.vehicle}
              cx="21"
              cy="21"
              r="15.9155"
              fill="none"
              stroke={a.color}
              strokeWidth="5"
              strokeDasharray={`${a.pct} ${100 - a.pct}`}
              strokeDashoffset={a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-xs text-slate-600">{t.totalEvents}</span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2">
        {arcs.map((a) => (
          <li key={a.vehicle} className="rounded-xl bg-indigo-50 px-4 py-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: a.color }} />
                {t.vehicles[a.vehicle] ?? a.vehicle}
              </span>
              <span className="font-semibold">{Math.round(a.pct)}%</span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-white">
              <div className="h-full rounded-full" style={{ width: `${a.pct}%`, background: a.color }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
