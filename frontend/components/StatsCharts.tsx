"use client";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SlotRow = { slot: string; accidents: number };
type VehicleRow = { vehicle: string; accidents: number };

const VEHICLE_COLORS: Record<string, string> = {
  Motorcycle: "#2563eb",
  Car: "#dc2626",
  Pedestrian: "#f59e0b",
  Bicycle: "#7c3aed",
  Bus: "#6b7280",
};

const slotConfig = {
  accidents: { label: "Accidents", color: "#2563eb" },
} satisfies ChartConfig;

export default function StatsCharts({
  slots,
  vehicles,
}: {
  slots: SlotRow[];
  vehicles: VehicleRow[];
}) {
  const vehicleConfig: ChartConfig = Object.fromEntries(
    vehicles.map((v) => [
      v.vehicle,
      { label: v.vehicle, color: VEHICLE_COLORS[v.vehicle] ?? "#9ca3af" },
    ])
  );
  const vehicleData = vehicles.map((v) => ({
    ...v,
    fill: `var(--color-${v.vehicle})`,
  }));
  const vehicleTotal = vehicles.reduce((sum, v) => sum + v.accidents, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Accidents by time of day</CardTitle>
          <CardDescription>
            Most accidents happen in the afternoon, when many students and
            vehicles are on the road.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={slotConfig} className="min-h-[220px] w-full">
            <BarChart accessibilityLayer data={slots}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="slot" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="accidents" fill="var(--color-accidents)" radius={6} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accidents by vehicle type</CardTitle>
          <CardDescription>{vehicleTotal} accidents in total</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={vehicleConfig} className="mx-auto min-h-[220px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={vehicleData}
                dataKey="accidents"
                nameKey="vehicle"
                innerRadius={55}
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>
          <ul className="mt-4 space-y-2 text-sm">
            {vehicles.map((v) => (
              <li key={v.vehicle} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: VEHICLE_COLORS[v.vehicle] ?? "#9ca3af" }}
                  />
                  {v.vehicle}
                </span>
                <span className="text-gray-600">
                  {Math.round((v.accidents / vehicleTotal) * 100)}% ({v.accidents})
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}