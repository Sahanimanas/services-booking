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
        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 " +
        (active ? "text-slate-900 bg-slate-100" : "text-slate-600 hover:text-slate-900")
      }
    >
      {children}
    </Link>
  );
}
