"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full bg-white p-2 shadow-md">
      {items.map((i) => {
        const active = pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              active ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}