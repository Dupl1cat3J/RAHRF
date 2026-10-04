import HazardMapView from "@/components/public/HazardMapView";
import PublicShell from "@/components/public/PublicShell";
import { dict } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getHotspots } from "@/lib/public-api";

export async function generateMetadata() {
  return { title: dict[await getLocale()].map.title };
}

export default async function HazardMapPage() {
  const locale = await getLocale();
  const t = dict[locale];
  const hotspots = await getHotspots();

  return (
    <PublicShell locale={locale}>
      <div className="space-y-5">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t.map.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{t.map.intro}</p>
        </header>

        {hotspots ? (
          <HazardMapView hotspots={hotspots} locale={locale} />
        ) : (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{t.error}</p>
        )}
      </div>
    </PublicShell>
  );
}
