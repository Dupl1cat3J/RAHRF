import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import LanguageSwitch from "@/components/LanguageSwitch";
import { isLoggedIn, LOGIN_REQUIRED, SESSION_COOKIE } from "@/lib/admin";
import { getT } from "@/lib/admin-i18n";
// import logos from "@/components//logos";

async function logout() {
  "use server";
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isLoggedIn())) redirect("/login");
  const { t } = await getT();

  const menu = [
    { href: "/admin/overview", label: t("navOverview") },
    { href: "/admin/data", label: t("navData") },
    { href: "/admin/predictive", label: t("navPredictive") },
    { href: "/admin/hotspots", label: t("navHotspots") },
    { href: "/admin/cost", label: t("navCost") },
    { href: "/admin/reports", label: t("navReports") },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-6 py-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3">
            <img src="/logos/dida.png" alt="DIDA" className="h-10 w-auto" />
            <img src="/logos/psu-ic.png" alt="PSU International College" className="h-10 w-auto" />
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold">RAHRF</span>{" "}
            <span className="text-2xl font-medium">Dashboard</span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <LanguageSwitch />
            <div className="text-right text-sm leading-tight">
              <div className="font-semibold">Dr. Sarayut Junkaew</div>
              <div className="text-gray-500">{t("roleAdmin")}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <User className="h-5 w-5" />
            </div>
            {LOGIN_REQUIRED && (
              <form action={logout}>
                <button type="submit" className="text-sm text-gray-600 underline">
                  {t("signOut")}
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <AdminNav items={menu} />
        <div className="text-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm">
            {t("demoBadge")}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}