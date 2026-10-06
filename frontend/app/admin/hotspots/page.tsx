import { redirect } from "next/navigation";
import HotspotsView from "@/components/accident-hotspots/HotspotsView";
import { isLoggedIn } from "@/lib/admin";
import { hotspotsText } from "@/lib/hotspots-content";
import { getLocale } from "@/lib/locale";
import { getHotspots } from "@/lib/public-api";

export async function generateMetadata() {
  return { title: hotspotsText[await getLocale()].title };
}

// Content only: the header and tab bar come from your existing admin layout.
export default async function HotspotsPage() {
  if (!(await isLoggedIn())) redirect("/login");

  const locale = await getLocale();
  const t = hotspotsText[locale];
  const hotspots = await getHotspots();
  const now = new Date();
  const stamp = new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Bangkok",
  }).format(now);

  return (
    <div lang={t.htmlLang} className="space-y-6">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t.title}</h1>
        <p className="mt-3 text-base text-slate-600 md:text-lg">{t.subtitle}</p>
        <p className="mt-3 text-sm text-slate-600">
          {t.lastUpdated}: {stamp} · <span className="font-semibold text-emerald-700">{t.synced}</span>
        </p>
      </header>

      {hotspots ? (
        <HotspotsView locale={locale} hotspots={hotspots} baseIso={now.toISOString()} />
      ) : (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{t.loadError}</p>
      )}
    </div>
  );
}
