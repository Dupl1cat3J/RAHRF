// MOCK map points for the PSU Hat Yai demo (not from the database).
// They are placed next to the real hotspot coordinates so every pin lands on campus.
// Replace this with a real endpoint when you have data for crossings and lit paths.
import type { Hotspot } from "@/lib/public-api";

export type PointType = "hazard" | "crossing" | "lit";

export type MockPoint = {
  id: string;
  type: PointType;
  name: string;
  lat: number;
  lng: number;
  messageIndex: number;
};

// Small shifts in degrees (roughly 20-70 m) so pins do not stack on top of each other.
const OFFSETS: [number, number][] = [
  [0.0004, 0.0005],
  [-0.0005, 0.0003],
  [0.0003, -0.0006],
  [-0.0004, -0.0004],
  [0.0006, 0.0001],
  [-0.0002, 0.0007],
];

export function buildMockPoints(hotspots: Hotspot[]): MockPoint[] {
  if (hotspots.length === 0) return [];
  const ranked = [...hotspots].sort((a, b) => b.riskScore - a.riskScore);
  const at = (i: number) => ranked[i % ranked.length];
  const shifted = (base: Hotspot, k: number) => ({
    name: base.name,
    lat: base.lat + OFFSETS[k % OFFSETS.length][0],
    lng: base.lng + OFFSETS[k % OFFSETS.length][1],
  });

  // Active hazards = the 3 highest-risk locations, pinned exactly on them
  const hazards: MockPoint[] = ranked.slice(0, 3).map((h, i) => ({
    id: `hazard-${i}`,
    type: "hazard",
    name: h.name,
    lat: h.lat,
    lng: h.lng,
    messageIndex: i,
  }));

  const crossings: MockPoint[] = Array.from({ length: 3 }, (_, i) => ({
    id: `crossing-${i}`,
    type: "crossing" as const,
    ...shifted(at(i + 1), i + 3),
    messageIndex: 0,
  }));

  const lit: MockPoint[] = Array.from({ length: 3 }, (_, i) => ({
    id: `lit-${i}`,
    type: "lit" as const,
    ...shifted(at(i + 2), i + 1),
    messageIndex: 0,
  }));

  return [...hazards, ...crossings, ...lit];
}
