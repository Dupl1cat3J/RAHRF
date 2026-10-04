import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  incidents: number;
  riskScore: number;
  riskLevel: number;
};

async function getHotspots(): Promise<Hotspot[] | null> {
  try {
    const res = await fetch(`${API}/api/public/hotspots`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Hotspots API status:", res.status, "URL:", API);
      return null;
    }
    return res.json();
  } catch (e) {
    console.error("Hotspots fetch failed:", e, "URL:", API);
    return null;
  }
}

const LEVEL = ["", "Low", "Medium", "High"];

export default async function HazardMapPage() {
  const hotspots = await getHotspots();

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <header>
        <h1 className="text-2xl font-semibold">PSU Hazard Map</h1>
        <p className="text-sm text-gray-600">
          Risk areas around the Hat Yai campus. Demo with simulated data. No
          personal information is shown.
        </p>
      </header>

      {!hotspots ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Cannot load data. Please check that the API server is running.
        </p>
      ) : (
        <>
          <HazardHeatMapLoader hotspots={hotspots} />
          <ul className="divide-y rounded-xl border bg-white">
            {hotspots.map((h) => (
              <li key={h.id} className="flex items-center justify-between p-3 text-sm">
                <span>{h.name}</span>
                <span className="text-gray-600">
                  {h.incidents} incidents · {LEVEL[h.riskLevel]} ({h.riskScore})
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}