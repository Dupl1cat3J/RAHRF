import { ArrowUp, Lightbulb, ShieldCheck, Users } from "lucide-react";
import { dict, type Locale } from "@/lib/i18n";
import { MOCK_CAMPUS, type SafetyLevel } from "@/lib/mock-campus";

// Set to false to hide the "Sample data" chip once real data is connected.
const SHOW_SAMPLE_CHIP = true;

const LEVEL_STYLE: Record<SafetyLevel, { pill: string; text: string; icon: string }> = {
  normal: { pill: "bg-emerald-600", text: "text-emerald-700", icon: "bg-emerald-50 text-emerald-600" },
  caution: { pill: "bg-amber-500", text: "text-amber-700", icon: "bg-amber-50 text-amber-600" },
  alert: { pill: "bg-red-600", text: "text-red-700", icon: "bg-red-50 text-red-600" },
};

function Frame({
  title,
  icon,
  iconClass = "bg-indigo-50 text-blue-600",
  sample,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  iconClass?: string;
  sample: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-600">{title}</p>
        <span className={`rounded-lg p-2 ${iconClass}`}>{icon}</span>
      </div>
      <div className="mt-3 flex-1">{children}</div>
      {SHOW_SAMPLE_CHIP && (
        <span className="mt-4 w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {sample}
        </span>
      )}
    </div>
  );
}

export function CampusSafetyCard({ locale }: { locale: Locale }) {
  const t = dict[locale].stats.campus;
  const { level, score } = MOCK_CAMPUS.safety;
  const st = LEVEL_STYLE[level];
  return (
    <Frame
      title={t.safetyTitle}
      icon={<ShieldCheck className="size-5" />}
      iconClass={st.icon}
      sample={t.sample}
    >
      <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xl font-semibold text-white ${st.pill}`}>
        <span className="size-2 rounded-full bg-white" />
        {t.levels[level]}
      </span>
      <p className={`mt-3 text-sm font-semibold ${st.text}`}>{score.toFixed(1)}/100</p>
      <p className="mt-2 text-sm text-slate-600">{t.safetyNotes[level]}</p>
    </Frame>
  );
}

export function WellLitCard({ locale }: { locale: Locale }) {
  const t = dict[locale].stats.campus;
  const { percent, change } = MOCK_CAMPUS.wellLit;
  return (
    <Frame title={t.wellLitTitle} icon={<Lightbulb className="size-5" />} sample={t.sample}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-5xl font-bold tracking-tight">{percent.toFixed(1)}%</p>
        <p className={`mb-2 flex items-center text-sm font-semibold ${change >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          <ArrowUp className={`size-3.5 ${change < 0 ? "rotate-180" : ""}`} aria-hidden />
          {change >= 0 ? "+" : ""}
          {change}%
        </p>
      </div>
      <p className="mt-3 text-sm text-slate-600">{t.wellLitNote}</p>
    </Frame>
  );
}

export function EscortsCard({ locale }: { locale: Locale }) {
  const t = dict[locale].stats.campus;
  const { completed, avgResponseMin } = MOCK_CAMPUS.escorts;
  return (
    <Frame title={t.escortsTitle} icon={<Users className="size-5" />} sample={t.sample}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-5xl font-bold tracking-tight">{completed}</p>
        <p className="mb-2 text-sm text-slate-500">{t.completed}</p>
      </div>
      <p className="mt-3 text-sm font-semibold text-emerald-700">{t.avgResponse(avgResponseMin)}</p>
      <p className="mt-2 text-sm text-slate-600">{t.escortsNote(completed)}</p>
    </Frame>
  );
}
