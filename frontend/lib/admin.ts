import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const SESSION_COOKIE = "rahrf_session";

// ปิดระบบล็อกอินไว้ก่อน ตั้ง REQUIRE_LOGIN=true เมื่อพร้อมใช้หน้า Login
export const LOGIN_REQUIRED = process.env.REQUIRE_LOGIN === "true";

export async function isLoggedIn() {
  if (!LOGIN_REQUIRED) return true;
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  return Boolean(secret && value === secret);
}

// เรียก API ของแอดมินจากฝั่งเซิร์ฟเวอร์เท่านั้น (คีย์ไม่ถูกส่งไปเบราว์เซอร์)
export async function adminFetch<T>(path: string): Promise<T | null> {
  if (!(await isLoggedIn())) redirect("/login");
  try {
    const res = await fetch(`${API}/api/admin${path}`, {
      headers: { "x-api-key": process.env.ADMIN_API_KEY ?? "" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Admin API status:", res.status, path);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error("Admin API failed:", e, path);
    return null;
  }
}