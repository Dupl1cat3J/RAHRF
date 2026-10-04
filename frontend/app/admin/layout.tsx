import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLoggedIn, SESSION_COOKIE } from "@/lib/admin";

const MENU = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/data", label: "Data Management" },
  { href: "/admin/predictive", label: "Predictive Analysis" },
  { href: "/admin/hotspots", label: "Accident Hotspots" },
  { href: "/admin/cost", label: "Risk & Cost" },
  { href: "/admin/reports", label: "Accident Reports" },
];

async function logout() {
  "use server";
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isLoggedIn())) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <span className="text-lg font-semibold">RAHRF Dashboard</span>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              Demo with simulated data
            </span>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-600 underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-3">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}