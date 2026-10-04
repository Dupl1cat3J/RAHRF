import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";
import StatsCharts from "@/components/StatsCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin";
import { toSlots } from "@/lib/slots";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Overview = {
  accidents: number;
  erVisits: number;
  severeInjuries: number;
  highRiskPredictions: number;
  totalMedicalCost: number;
  assetDamageCost: number;
  totalCostOfInaction: number;
};
type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  incidents: number;
  riskScore: number;
  riskLevel: number;
};
type Stats = {
  byVehicle: { vehicle: string; accidents: number }[];
  byHour: { hour: number; count: number }[];
};

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

const baht = (n: number) => `฿${Math.round(n).toLocaleString("en-US")}`;
const LEVEL = ["", "Low", "Medium", "High"];

export default async function OverviewPage() {
  const [overview, hotspots, stats] = await Promise.all([
    adminFetch<Overview>("/overview"),
    publicFetch<Hotspot[]>("/api/public/hotspots"),
    publicFetch<Stats>("/api/public/stats"),
  ]);

  if (!overview || !hotspots || !stats) {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
        Cannot load data. Please check that the API server is running.
      </p>
    );
  }

  const loss = overview.totalMedicalCost + overview.assetDamageCost;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Road Safety Overview</h1>
        <p className="text-sm text-gray-600">
          Summary of accident statistics, predictive risk hotspots, and estimated cost.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total accidents</CardDescription>
            <CardTitle className="text-3xl">{overview.accidents}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {overview.erVisits} ER visits
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Casualties and injuries</CardDescription>
            <CardTitle className="text-3xl">{overview.severeInjuries} severe</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {overview.highRiskPredictions} high-risk predictions
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Estimated financial loss</CardDescription>
            <CardTitle className="text-3xl">{baht(loss)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Medical {baht(overview.totalMedicalCost)} · Property {baht(overview.assetDamageCost)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Accident hotspot map</CardTitle>
            </CardHeader>
            <CardContent>
              <HazardHeatMapLoader hotspots={hotspots} />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Hazardous locations</CardTitle>
            <CardDescription>Sorted by predicted risk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hotspots.slice(0, 5).map((h) => (
              <div key={h.id} className="text-sm">
                <div className="flex justify-between gap-2">
                  <span>{h.name}</span>
                  <span className="shrink-0 text-gray-600">
                    {LEVEL[h.riskLevel]} ({h.riskScore})
                  </span>
                </div>
                <div className="text-xs text-gray-500">{h.incidents} incidents</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <StatsCharts slots={toSlots(stats.byHour)} vehicles={stats.byVehicle} />
    </div>
  );
}