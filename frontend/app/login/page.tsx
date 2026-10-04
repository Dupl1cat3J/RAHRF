import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/admin";

async function login(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "");
  const expected = process.env.DEMO_ADMIN_CODE;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret || code !== expected) {
    redirect("/login?error=1");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin/overview");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold">RAHRF Road Safety Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor accidents, identify risky areas, and support road safety decisions.
          </p>
        </div>
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          Authorized personnel only. PSU Passport sign-in is simulated in this
          demo. Enter the demo access code.
        </p>
        <input
          name="code"
          type="password"
          placeholder="Demo access code"
          autoComplete="off"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">Incorrect access code.</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign in with PSU Passport
        </button>
      </form>
    </main>
  );
}