import { Info } from "lucide-react";
import { dict, type Locale } from "@/lib/i18n";

export type SlotKey = "morning" | "midday" | "afternoon" | "night";
export type Slot = { key: SlotKey; range: string; count: number };

const BAR_MAX_PX = 140;

export default function TimeOfDayChart({
  slots,
  locale,
}: {
  slots: Slot[];
  locale: Locale;
}) {
  const t = dict[locale].stats;
  const max = Math.max(...slots.map((s) => s.count), 0);
  const busiest = max > 0 ? slots.find((s) => s.count === max) : undefined;

  return (
    <div>
      <div className="rounded-2xl bg-indigo-50 p-4">
        <div className="flex items-end justify-between gap-2 sm:gap-4">
          {slots.map((s) => {
            const isPeak = s === busiest;
            const label = t.slots[s.key];
            const h = max > 0 ? Math.max((s.count / max) * BAR_MAX_PX, 6) : 6;
            return (
              <div key={s.key} className="flex flex-1 flex-col items-center justify-end gap-1">
                {isPeak && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-center text-[11px] font-semibold leading-tight text-red-700">
                    {t.busiest}
                  </span>
                )}
                <span className="text-sm font-semibold">{s.count}</span>
                <div
                  className={`w-full max-w-16 rounded-t-md ${isPeak ? "bg-red-600" : "bg-blue-500"}`}
                  style={{ height: h }}
                  role="img"
                  aria-label={t.accidentsAria(label, s.count)}
                />
                <div className="mt-1 text-center">
                  <div className={`text-[11px] font-medium leading-tight sm:text-xs ${isPeak ? "text-red-700" : "text-slate-700"}`}>
                    {label}
                  </div>
                  <div className="text-[10px] leading-tight text-slate-500 sm:text-[11px]">
                    {s.range}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {busiest && (
        <p className="mt-3 flex gap-2 rounded-xl bg-indigo-50 p-3 text-sm text-slate-700">
          <Info className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
          {t.busiestInsight(t.slots[busiest.key], busiest.range)}
        </p>
      )}
    </div>
  );
}
