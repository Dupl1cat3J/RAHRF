import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./i18n";

// Server-only: reads the language the visitor picked with the toggle.
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v === "th" || v === "en" ? v : DEFAULT_LOCALE;
}
