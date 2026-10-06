// ข้อมูลตัวอย่าง: ยังไม่มีการเชื่อมต่อ HIS / เซนเซอร์จราจร / ระบบ GIS จริง
type Tone = "good" | "bad" | "info" | "plain";
type Source = {
  tag: string;
  title: string;
  desc: string;
  metrics: { label: string; value: string; tone: Tone }[];
  chart?: { label: string; value: string; points: number[]; color: string };
  updates?: string[];
  updated: string;
};

const SOURCES: Source[] = [
  {
    tag: "DATA SOURCE 01",
    title: "HIS (Hospital Information System)",
    desc: "Accident-related hospital visits, injuries, and medical treatment records. Personal information is protected under PDPA.",
    metrics: [
      { label: "Response Speed", value: "42ms", tone: "good" },
      { label: "Sync Errors", value: "0 errors", tone: "good" },
    ],
    chart: { label: "Records Today", value: "1,428 rec", points: [8, 7, 9, 8, 10, 9, 8, 11, 14, 17, 20, 21, 22], color: "#15803d" },
    updated: "Today, 14:18",
  },
  {
    tag: "DATA SOURCE 02",
    title: "Traffic & Accident",
    desc: "Pulling live traffic conditions, weather data, and reported road accident logs from campus security sensors.",
    metrics: [
      { label: "Active Sensors", value: "24 online", tone: "info" },
      { label: "Missing Records", value: "None missing", tone: "good" },
    ],
    chart: { label: "Records per hour", value: "420 records/min", points: [12, 4, 13, 3, 12, 4, 14, 3, 12, 5, 13, 4, 12, 3, 13], color: "#2563eb" },
    updated: "Today, 14:19",
  },
  {
    tag: "DATA SOURCE 03",
    title: "Spatial GIS",
    desc: "Updating map coordinates, road networks, and spatial risk clusters for the Public Hazard Map.",
    metrics: [
      { label: "Map Updates", value: "EPSG:3857 WGS84", tone: "info" },
      { label: "Pending Updates", value: "18 areas", tone: "bad" },
    ],
    updates: ["Faculty of Engineer Rd.", "Updated Risk Zone"],
    updated: "Yesterday, 23:00",
  },
];

const TONE: Record<Tone, string> = {
  good: "text-green-700",
  bad: "text-red-600",
  info: "text-blue-600",
  plain: "text-slate-800",
};

function Spark({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = 100 / (points.length - 1);
  const y = (v: number) => 28 - ((v - min) / (max - min || 1)) * 24;
  const line = points.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-12 w-full">
      <path d={`${line} L100,30 L0,30 Z`} fill={color} opacity="0.1" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function SourceStatusCards() {
  return (
    <div>
      <p className="mb-3 inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        Demo with simulated data
      </p>
      <div className="grid gap-5 lg:grid-cols-3">
        {SOURCES.map((s) => (
          <article key={s.tag} className="flex flex-col rounded-3xl bg-white p-5 shadow-md">
            <p className="text-xs font-semibold tracking-wide text-blue-600">{s.tag}</p>
            <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{s.desc}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-center">
              {s.metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-xs text-slate-500">{m.label}</p>
                  <p className={`text-base font-bold ${TONE[m.tone]}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {s.chart && (
              <div className="mt-3">
                <div className="flex items-end justify-between text-xs text-slate-500">
                  <span>{s.chart.label}</span>
                  <span className="text-base font-semibold text-slate-800">{s.chart.value}</span>
                </div>
                <Spark points={s.chart.points} color={s.chart.color} />
              </div>
            )}
            {s.updates && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <p className="mb-1 font-semibold uppercase tracking-wide text-slate-400">Recent map updates</p>
                {s.updates.map((u) => (
                  <p key={u}>• {u}</p>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-4">
              <div>
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm font-semibold">{s.updated}</p>
              </div>
              <button
                disabled
                title="Not connected yet"
                className="cursor-not-allowed rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white opacity-60"
              >
                Sync Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}