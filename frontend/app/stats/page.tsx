import { Clock, MapPin, PieChart, ShieldAlert, TriangleAlert, Users } from "lucide-react";
import PublicShell from "@/components/public/PublicShell";
import TimeOfDayChart, { type Slot, type SlotKey } from "@/components/public/TimeOfDayChart";
import VehicleDonut from "@/components/public/VehicleDonut";
import { dict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getHotspots, getPublicStats } from "@/lib/public-api";

export async function generateMetadata() {
  return { title: dict[await getLocale()].stats.title };
}

// Edit these windows to change the time-of-day chart.
// An hour h covers h:00-h:59, so 7-9 approximates 07:30-09:30.
const SLOT_CONFIG: { key: SlotKey; range: string; hours: number[] }[] = [
  { key: "morning", range: "07:30 - 09:30", hours: [7, 8, 9] },
  { key: "midday", range: "11:30 - 13:30", hours: [11, 12, 13] },
  { key: "afternoon", range: "16:30 - 18:30", hours: [16, 17, 18] },
  { key: "night", range: "21:00 - 01:00", hours: [21, 22, 23, 0, 1] },
];

// Optional photos: map a road name to a file in frontend/public/roads/
const ROAD_IMAGES: Record<string, string> = {
  // "Faculty of Engineering Road": "/roads/engineering.jpg",
};

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        <span className="rounded-lg bg-indigo-50 p-2 text-blue-600">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        <span className="rounded-lg bg-indigo-50 p-2 text-blue-600">{icon}</span>
      </div>
      <p className="mt-2 text-5xl font-bold tracking-tight">{value}</p>
      <p className="mt-3 text-sm text-slate-600">{note}</p>
    </div>
  );
}

export default async function StatsPage() {
  const locale = await getLocale();
  const t = dict[locale];
  const [stats, hotspots] = await Promise.all([getPublicStats(), getHotspots()]);

  if (!stats) {
    return (
      <PublicShell locale={locale}>
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{t.error}</p>
      </PublicShell>
    );
  }

  const slots: Slot[] = SLOT_CONFIG.map((s) => ({
    key: s.key,
    range: s.range,
    count: stats.byHour
      .filter((h) => s.hours.includes(h.hour))
      .reduce((a, h) => a + h.count, 0),
  }));

  const highRisk = hotspots ? hotspots.filter((h) => h.riskLevel === 3).length : null;

  return (
    <PublicShell locale={locale}>
      <div className="space-y-5">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t.stats.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{t.stats.intro}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={t.stats.totalIncidents}
            value={stats.totalAccidents}
            note={t.stats.totalIncidentsNote}
            icon={<TriangleAlert className="size-5" />}
          />
          <StatCard
            label={t.stats.casualties}
            value={stats.totalCasualties}
            note={t.stats.casualtiesNote}
            icon={<Users className="size-5" />}
          />
          <StatCard
            label={t.stats.highRisk}
            value={highRisk ?? "-"}
            note={hotspots ? t.stats.highRiskNote(hotspots.length) : t.stats.highRiskUnavailable}
            icon={<ShieldAlert className="size-5" />}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Section
            title={t.stats.timeTitle}
            description={t.stats.timeDesc}
            icon={<Clock className="size-5" />}
          >
            <TimeOfDayChart slots={slots} locale={locale} />
          </Section>

          <Section
            title={t.stats.vehicleTitle}
            description={t.stats.vehicleDesc}
            icon={<PieChart className="size-5" />}
          >
            <VehicleDonut vehicles={stats.byVehicle} locale={locale} />
          </Section>
        </div>

        {stats.topRoads.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t.stats.roadsTitle}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.topRoads.map((r) => {
                const img = ROAD_IMAGES[r.roadName];
                return (
                  <article
                    key={r.roadName}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={r.roadName} className="size-full object-cover" />
                      ) : (
                        <MapPin className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
                      )}
                      <span className="absolute bottom-2 right-2 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
                        {t.stats.incidents(r.accidents)}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{r.roadName}</h3>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {t.stats.casualtiesCount(r.casualties)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
