export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function GET() {
  const key = process.env.ADMIN_API_KEY;
  if (!key) return Response.json({ error: "ADMIN_API_KEY is not set in frontend/.env.local" }, { status: 500 });
  try {
    const upstream = await fetch(`${API}/api/admin/data/uploads`, { headers: { "x-api-key": key }, cache: "no-store" });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return Response.json({ error: "Cannot reach the API server" }, { status: 502 });
  }
}