import { getLang, getT } from "@/lib/admin-i18n";
import { setLanguage } from "@/app/actions";

export default async function LanguageSwitch() {
  const lang = await getLang();
  return (
    <form action={setLanguage} className="inline-flex rounded-full border bg-white p-0.5 text-xs">
      {(["en", "th"] as const).map((l) => (
        <button
          key={l}
          type="submit"
          name="lang"
          value={l}
          className={`rounded-full px-3 py-1 font-medium ${
            lang === l ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {l === "en" ? "EN" : "ไทย"}
        </button>
      ))}
    </form>
  );
}