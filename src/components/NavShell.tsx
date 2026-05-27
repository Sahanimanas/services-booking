"use client";

import { useEffect, useState } from "react";
import NavLink from "@/components/NavLink";

type LinkItem = { href: string; label: string };

/**
 * Floating glass navbar shell. Frosted at the top of the page, a touch more
 * opaque once scrolled (or when the mobile menu is open) so links stay legible.
 * On mobile the links collapse into a hamburger dropdown.
 */
export default function NavShell({
  brand,
  links,
  cart,
  desktopActions,
  mobileActions,
}: {
  brand: React.ReactNode;
  links: LinkItem[];
  cart: React.ReactNode;
  desktopActions: React.ReactNode;
  mobileActions: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const frosted = scrolled || open;

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-5 lg:px-8 pt-3">
      <div
        className={
          "max-w-screen-2xl mx-auto rounded-2xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 backdrop-blur-xl ring-1 transition duration-300 " +
          (frosted
            ? "bg-white/80 ring-white/60 shadow-soft"
            : "bg-white/25 ring-white/40 shadow-lg shadow-slate-900/5")
        }
      >
        {brand}

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          {cart}
          <div className="hidden md:flex items-center gap-2">{desktopActions}</div>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open ? "true" : "false"}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-slate-300 text-slate-800 hover:bg-slate-100 transition"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute right-3 sm:right-5 top-[4.85rem] w-56 rounded-2xl bg-white/45 backdrop-blur-2xl ring-1 ring-white/50 shadow-lg shadow-slate-900/10 p-2">
          <nav className="flex flex-col gap-0.5" onClick={() => setOpen(false)}>
            {links.map((l) => (
              <NavLink key={l.href} href={l.href}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div
            className="mt-1.5 pt-2 border-t border-white/40 flex flex-col gap-1.5"
            onClick={() => setOpen(false)}
          >
            {mobileActions}
          </div>
        </div>
      )}
    </header>
  );
}
