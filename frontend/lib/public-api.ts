const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  incidents: number;
  riskScore: number;
  riskLevel: number; // 1 = Low, 2 = Medium, 3 = High
};

export type PublicStats = {
  totalAccidents: number;
  totalCasualties: number;
  topRoads: { roadName: string; accidents: number; casualties: number }[];
  byWeather: { weather: string; accidents: number }[];
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

export const getPublicStats = () => publicFetch<PublicStats>("/api/public/stats");
export const getHotspots = () => publicFetch<Hotspot[]>("/api/public/hotspots");
