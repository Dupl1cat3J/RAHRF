import { dict, type Locale } from "@/lib/i18n";
import PublicNav from "./PublicNav";

// Google Sans is loaded with @import in app/globals.css.
const FONT_FAMILY = '"Google Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

// Put logo files in frontend/public/logos/ and uncomment the lines below.
const LOGOS: { src: string; alt: string }[] = [
   { src: "/logos/dida.png", alt: "DIDA" },
   { src: "/logos/psu-ic.png", alt: "PSU International College" },
];

export default function PublicShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = dict[locale];

  return (
    <div
      lang={t.htmlLang}
      style={{ fontFamily: FONT_FAMILY }}
      className={`flex min-h-screen flex-col bg-slate-50 text-slate-900 ${
        locale === "th" ? "leading-relaxed" : ""
      }`}
    >
      <header className="mx-auto flex w-full max-w-5xl items-center justify-center gap-4 px-4 py-4">
        {LOGOS.length > 0 ? (
          LOGOS.map((l) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={l.src} src={l.src} alt={l.alt} className="h-9 w-auto md:h-11" />
          ))
        ) : (
          <span className="text-sm font-semibold text-slate-700">{t.brand}</span>
        )}
      </header>

      <PublicNav locale={locale} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-6 md:pt-10">
        {children}
      </main>

      <footer className="border-t bg-white px-4 py-6 text-center text-xs text-slate-600">
        <p className="mx-auto max-w-md">{t.footer}</p>
      </footer>
    </div>
  );
}
