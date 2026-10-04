import StatsCharts from "@/components/StatsCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Stats = {
  totalAccidents: number;
  topRoads: { roadName: string; accidents: number }[];
  byVehicle: { vehicle: string; accidents: number }[];
  byHour: { hour: number; count: number }[];
};

async function getStats(): Promise<Stats | null> {
  try {
    const res = await fetch(`${API}/api/public/stats`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Stats API status:", res.status, "URL:", API);
      return null;
    }
    return res.json();
  } catch (e) {
    console.error("Stats fetch failed:", e, "URL:", API);
    return null;
  }
}

// จัดชั่วโมง (เวลาไทย) เป็น 4 ช่วงเวลา
const SLOTS = [
  { name: "Morning", test: (h: number) => h >= 6 && h <= 10 },
  { name: "Midday", test: (h: number) => h >= 11 && h <= 14 },
  { name: "Afternoon", test: (h: number) => h >= 15 && h <= 18 },
  { name: "Night", test: (h: number) => h >= 19 || h <= 5 },
];

export default async function StatsPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Cannot load data. Please check that the API server is running.
        </p>
      </main>
    );
  }

  const slots = SLOTS.map((s) => ({
    slot: s.name,
    accidents: stats.byHour.filter((r) => s.test(r.hour)).reduce((sum, r) => sum + r.count, 0),
  }));
  const busiest = [...slots].sort((a, b) => b.accidents - a.accidents)[0];
  const maxRoad = Math.max(...stats.topRoads.map((r) => r.accidents), 1);

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-semibold">PSU Road Safety Stats</h1>
        <p className="text-sm text-gray-600">
          Accident data around PSU Hat Yai. Demo with simulated data. No
          personal information is shown.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardDescription>Total incidents</CardDescription>
            <CardTitle className="text-3xl">{stats.totalAccidents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Busiest period</CardDescription>
            <CardTitle className="text-3xl">{busiest.slot}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {busiest.accidents} incidents
          </CardContent>
        </Card>
      </div>

      <StatsCharts slots={slots} vehicles={stats.byVehicle} />

      <Card>
        <CardHeader>
          <CardTitle>Roads with the most incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.topRoads.map((r) => (
            <div key={r.roadName} className="text-sm">
              <div className="flex justify-between">
                <span>{r.roadName}</span>
                <span className="text-gray-600">{r.accidents}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${(r.accidents / maxRoad) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}