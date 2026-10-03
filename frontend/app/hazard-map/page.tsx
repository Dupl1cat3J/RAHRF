import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";

const sample = [
  { id: "H1", name: "Faculty of Engineer Road", lat: 7.0075, lng: 100.4975, riskScore: 82 },
  { id: "H2", name: "Sport Complex Road", lat: 7.0050, lng: 100.4990, riskScore: 74 },
  { id: "H3", name: "Faculty of Liberal Arts Road", lat: 7.0090, lng: 100.4950, riskScore: 55 },
];

export default function HazardMapPage() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">PSU Hazard Map</h1>
      <HazardHeatMapLoader hotspots={sample} />
    </main>
  );
}