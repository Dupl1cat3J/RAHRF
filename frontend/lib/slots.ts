const SLOTS = [
  { name: "Morning", test: (h: number) => h >= 6 && h <= 10 },
  { name: "Midday", test: (h: number) => h >= 11 && h <= 14 },
  { name: "Afternoon", test: (h: number) => h >= 15 && h <= 18 },
  { name: "Night", test: (h: number) => h >= 19 || h <= 5 },
];

export function toSlots(byHour: { hour: number; count: number }[]) {
  return SLOTS.map((s) => ({
    slot: s.name,
    accidents: byHour.filter((r) => s.test(r.hour)).reduce((sum, r) => sum + r.count, 0),
  }));
}