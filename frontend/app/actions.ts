"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLanguage(formData: FormData) {
  const lang = formData.get("lang") === "th" ? "th" : "en";
  const store = await cookies();
  store.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}