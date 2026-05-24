"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "px-4 py-2 rounded-lg text-sm font-medium transition " +
        (active
          ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
          : "text-slate-700 hover:text-slate-900 hover:bg-slate-50")
      }
    >
      {children}
    </Link>
  );
}
