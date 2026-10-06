import { Fragment } from "react";

const COLORS = ["#eef2ff", "#dbeafe", "#fecaca", "#f87171", "#b91c1c"];

function level(v: number, max: number) {
  if (max === 0 || v === 0) return 0;
  const r = v / max;
  return r < 0.34 ? 1 : r < 0.67 ? 2 : r < 0.9 ? 3 : 4;
}

export default function TimeRiskHeatmap({
  counts,
  days,
  windows,
  dayHeader,
  lowLabel,
  criticalLabel,
}: {
  counts: number[][];
  days: string[];
  windows: string[];
  dayHeader: string;
  lowLabel: string;
  criticalLabel: string;
}) {
  const max = Math.max(...counts.flat(), 0);

  return (
    <div>
      <div className="grid grid-cols-[4rem_repeat(6,1fr)] gap-1.5 text-xs">
        <div className="text-gray-500">{dayHeader}</div>
        {windows.map((w) => (
          <div key={w} className="text-center text-gray-500">
            {w}
          </div>
        ))}
        {counts.map((row, i) => (
          <Fragment key={i}>
            <div className="flex items-center text-sm font-medium">{days[i]}</div>
            {row.map((v, j) => {
              const l = level(v, max);
              return (
                <div
                  key={j}
                  className="flex h-9 items-center justify-center rounded-md text-sm"
                  style={{ background: COLORS[l], color: l >= 3 ? "#ffffff" : "#374151" }}
                >
                  {v}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-500">
        <span>{lowLabel}</span>
        {COLORS.slice(1).map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        ))}
        <span>{criticalLabel}</span>
      </div>
    </div>
  );
}