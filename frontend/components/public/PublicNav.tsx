"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { dict, type Locale } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function PublicNav({ locale }: { locale: Locale }) {
  const t = dict[locale].nav;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const barRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const links = [
    { href: "/stats", label: t.stats, active: pathname === "/" || pathname === "/stats" },
    { href: "/hazard-map", label: t.map, active: pathname === "/hazard-map" },
  ];

  function openMenu() {
    // The overlay starts where the blue bar starts, so the logos stay visible.
    setTop(Math.max(0, barRef.current?.getBoundingClientRect().top ?? 0));
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <nav ref={barRef} className="bg-blue-600 text-white" aria-label={t.main}>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
        <div className="flex items-center">
          <button
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t.openMenu}
            className="-ml-2 my-1 rounded-lg p-3 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-white md:hidden"
          >
            <Menu className="size-6" />
          </button>

          <ul className="hidden gap-1 py-2 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={l.active ? "page" : undefined}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-white ${
                    l.active ? "bg-white/20" : "hover:bg-blue-700"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <LanguageToggle locale={locale} />
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.menu}
          className="fixed inset-x-0 bottom-0 z-[2000] flex flex-col bg-blue-600 text-white md:hidden"
          style={{ top }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.closeMenu}
            className="m-2 w-fit rounded-lg p-3 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="size-7" />
          </button>

          <ul className="flex flex-1 flex-col items-center justify-center gap-10 pb-24 text-center">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={l.active ? "page" : undefined}
                  className={`rounded-lg px-4 py-2 text-xl font-semibold focus-visible:outline-2 focus-visible:outline-white ${
                    l.active ? "underline decoration-2 underline-offset-8" : ""
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex justify-center pb-10">
            <LanguageToggle locale={locale} />
          </div>
        </div>
      )}
    </nav>
  );
}
