"use client";
import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS: Record<string, string> = {
  Motorcycle: "#2563eb",
  Car: "#dc2626",
  Pedestrian: "#f59e0b",
  Bicycle: "#7c3aed",
  Bus: "#6b7280",
};

type Row = { vehicle: string; name: string; accidents: number };

export default function VehicleDonut({
  rows,
  centerLabel,
  incLabel,
}: {
  rows: Row[];
  centerLabel: string;
  incLabel: string;
}) {
  const total = rows.reduce((s, r) => s + r.accidents, 0);
  const config: ChartConfig = Object.fromEntries(
    rows.map((r) => [r.vehicle, { label: r.name, color: COLORS[r.vehicle] ?? "#9ca3af" }]),
  );
  const data = rows.map((r) => ({ ...r, fill: `var(--color-${r.vehicle})` }));

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[230px_1fr]">
      <div className="relative mx-auto h-[230px] w-[230px]">
        <ChartContainer config={config} className="h-full w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="vehicle" />} />
            <Pie
              data={data}
              dataKey="accidents"
              nameKey="vehicle"
              innerRadius={72}
              outerRadius={108}
              strokeWidth={2}
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold">{total}</span>
          <span className="text-xs tracking-wide text-gray-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-3 text-sm">
        {rows.map((r) => (
          <li key={r.vehicle} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: COLORS[r.vehicle] ?? "#9ca3af" }}
              />
              {r.name}
            </span>
            <span className="text-gray-600">
              {r.accidents} {incLabel}
              <b className="ml-3 text-gray-900">
                {total > 0 ? Math.round((r.accidents / total) * 100) : 0}%
              </b>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}