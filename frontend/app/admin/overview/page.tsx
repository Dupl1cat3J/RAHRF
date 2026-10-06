import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import HazardHeatMapLoader from "@/components/HazardHeatMapLoader";
import TimeRiskHeatmap from "@/components/admin/TimeRiskHeatmap";
import VehicleDonut from "@/components/admin/VehicleDonut";
import { adminFetch } from "@/lib/admin";
import { getT } from "@/lib/admin-i18n";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Overview = {
  totalAccidents: number;
  severeInjuries: number;
  severeHigh: number;
  severeMedium: number;
  fatalities: number;
  medicalCost: number;
  assetDamageCost: number;
  totalLoss: number;
  trends: { accidents: number | null; severe: number | null; loss: number | null };
  byVehicle: { vehicle: string; accidents: number }[];
  primaryVehicleByRoad: Record<string, string>;
  heatmap: number[][];
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

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

function baht(n: number) {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `฿${Math.round(n / 1_000)}K`;
  return `฿${Math.round(n)}`;
}

const LEVEL: Record<number, { key: string; text: string; bg: string; bar: string }> = {
  3: { key: "levelHigh", text: "text-red-700", bg: "bg-red-100", bar: "bg-red-600" },
  2: { key: "levelMedium", text: "text-orange-700", bg: "bg-orange-100", bar: "bg-orange-500" },
  1: { key: "levelLow", text: "text-blue-700", bg: "bg-blue-100", bar: "bg-blue-500" },
};

const WINDOWS = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];
const DAY_KEYS = ["dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat", "daySun"];

const cardBox = "rounded-2xl bg-white p-5 shadow-sm";
const linkStyle = "inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline";

function Trend({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        up ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

function Meter({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="mt-1 h-1.5 rounded-full bg-gray-100">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export default async function OverviewPage() {
  const { t } = await getT();
  const [o, hotspots] = await Promise.all([
    adminFetch<Overview>("/overview"),
    publicFetch<Hotspot[]>("/api/public/hotspots"),
  ]);

  if (!o || !hotspots) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{t("loadError")}</p>;
  }

  const total = o.totalAccidents;
  const top2 = o.byVehicle.slice(0, 2);
  const medicalPct = o.totalLoss > 0 ? Math.round((o.medicalCost / o.totalLoss) * 100) : 0;
  const days = DAY_KEYS.map((k) => t(k));
  const veh = (v?: string) => (v ? t("veh" + v, v) : "-");

  let peak = { d: 0, w: 0, v: -1 };
  o.heatmap.forEach((row, d) =>
    row.forEach((v, w) => {
      if (v > peak.v) peak = { d, w, v };
    }),
  );

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">{t("ovTitle")}</h1>
        <p className="mt-2 text-gray-600">{t("ovSub")}</p>
      </header>

      {/* การ์ดบน 3 ใบ */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className={`${cardBox} border-l-8 border-l-red-600`}>
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-700">{t("cTotal")}</span>
            <Trend value={o.trends.accidents} />
          </div>
          <div className="mt-3 text-5xl font-semibold">
            {total} <span className="text-xl font-normal text-gray-500">{t("cIncidents")}</span>
          </div>
          <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-3 text-sm">
            {top2.map((v, i) => {
              const pct = total > 0 ? Math.round((v.accidents / total) * 100) : 0;
              return (
                <div key={v.vehicle}>
                  <div className="flex justify-between">
                    <span>{veh(v.vehicle)}</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <Meter pct={pct} color={i === 0 ? "bg-red-600" : "bg-blue-600"} />
                </div>
              );
            })}
          </div>
          <Link href="/admin/reports" className={`${linkStyle} mt-4`}>
            {t("viewPatient")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardBox} border-l-8 border-l-emerald-700`}>
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-700">{t("cCasualties")}</span>
            <Trend value={o.trends.severe} />
          </div>
          <div className="mt-3 text-5xl font-semibold">
            {o.severeInjuries}{" "}
            <span className="text-xl font-normal text-gray-500">
              {t("cSevere")} /{" "}
              <span className="text-emerald-700">
                {o.fatalities} {t("cFatalities")}
              </span>
            </span>
          </div>
          <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span>{t("cHigh")}</span>
              <span className="font-medium">
                {o.severeHigh} {t("cCases")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("cMedium")}</span>
              <span className="font-medium">
                {o.severeMedium} {t("cCases")}
              </span>
            </div>
          </div>
          <Link href="/admin/reports" className={`${linkStyle} mt-4`}>
            {t("viewPatient")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={`${cardBox} border-l-8 border-l-blue-600`}>
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-700">{t("cLoss")}</span>
            <Trend value={o.trends.loss} />
          </div>
          <div className="mt-3 text-5xl font-semibold">
            {baht(o.totalLoss)}{" "}
            <span className="text-xl font-normal text-gray-500">{t("cTotalCost")}</span>
          </div>
          <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-3 text-sm">
            <div>
              <div className="flex justify-between">
                <span>{t("cMedical")}</span>
                <span className="font-medium">
                  {baht(o.medicalCost)} ({medicalPct}%)
                </span>
              </div>
              <Meter pct={medicalPct} color="bg-blue-600" />
            </div>
            <div>
              <div className="flex justify-between">
                <span>{t("cAsset")}</span>
                <span className="font-medium">
                  {baht(o.assetDamageCost)} ({100 - medicalPct}%)
                </span>
              </div>
              <Meter pct={100 - medicalPct} color="bg-blue-400" />
            </div>
          </div>
          <Link href="/admin/cost" className={`${linkStyle} mt-4`}>
            {t("viewFinancial")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* แถวกลาง: แผนที่ + จุดอันตราย */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className={cardBox}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{t("mapTitle")}</h2>
              <p className="text-sm text-gray-600">{t("mapSub")}</p>
            </div>
            <Link href="/admin/hotspots" className={linkStyle}>
              {t("viewMap")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <HazardHeatMapLoader hotspots={hotspots} />
          <div className="mt-3 flex flex-wrap items-center gap-4 rounded-full bg-gray-800 px-4 py-2 text-xs text-white">
            <span>{t("riskLevel")}:</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-600" /> {t("levelHigh")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> {t("levelMedium")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> {t("levelLow")}
            </span>
          </div>
        </div>

        <div className={cardBox}>
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-semibold">{t("hazTitle")}</h2>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium">
              {t("hazTop")}
            </span>
          </div>
          <p className="text-sm text-gray-600">{t("hazSub")}</p>
          <div className="mt-4 space-y-4">
            {hotspots.slice(0, 5).map((h, i) => {
              const lv = LEVEL[h.riskLevel] ?? LEVEL[1];
              return (
                <div key={h.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${lv.bar}`}
                      >
                        {i + 1}
                      </span>
                      {h.name}
                    </span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${lv.bg} ${lv.text}`}>
                      {t(lv.key)} ({h.riskScore}%)
                    </span>
                  </div>
                  <Meter pct={h.riskScore} color={lv.bar} />
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>
                      {t("primary")}: {veh(o.primaryVehicleByRoad[h.name])}
                    </span>
                    <span>
                      {h.incidents} {t("incidents")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/admin/hotspots"
            className="mt-5 flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t("analyze")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* แถวล่าง: Time & Risk Distribution + Vehicle */}
      <div className="grid gap-4 lg:grid-cols-[4fr_5fr]">
        <div className={cardBox}>
          <h2 className="text-2xl font-semibold">{t("timeTitle")}</h2>
          <p className="mb-4 text-sm text-gray-600">{t("timeSub")}</p>
          <TimeRiskHeatmap
            counts={o.heatmap}
            days={days}
            windows={WINDOWS}
            dayHeader={t("dayWindow")}
            lowLabel={t("lowRisk")}
            criticalLabel={t("critical")}
          />
          <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm">
            <div className="font-medium text-red-700">
              {t("peakWindow")}: {days[peak.d]} {WINDOWS[peak.w]}
            </div>
            <div className="text-gray-600">{t("peakNote")}</div>
          </div>
          <Link href="/admin/predictive" className={`${linkStyle} mt-4`}>
            {t("viewPredictive")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={cardBox}>
          <h2 className="text-2xl font-semibold">{t("vehTitle")}</h2>
          <p className="mb-4 text-sm text-gray-600">{t("vehSub")}</p>
          <VehicleDonut
            rows={o.byVehicle.map((v) => ({ ...v, name: veh(v.vehicle) }))}
            centerLabel={t("collisions")}
            incLabel={t("inc")}
          />
          <Link href="/admin/reports" className={`${linkStyle} mt-6`}>
            {t("viewRecords")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}