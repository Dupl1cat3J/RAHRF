"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, dict, type Locale } from "@/lib/i18n";

export default function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    start(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={dict[locale].nav.language}
      className={`inline-flex rounded-full bg-white/20 p-0.5 text-sm font-semibold ${
        pending ? "opacity-70" : ""
      }`}
    >
      {(["th", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          onClick={() => choose(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-white ${
            locale === l ? "bg-white text-blue-700" : "text-white hover:bg-white/10"
          }`}
        >
          {l === "th" ? "ไทย" : "EN"}
        </button>
      ))}
    </div>
  );
}
