"use client";

import { useState } from "react";
import NavLink from "@/components/NavLink";
import LocationPicker from "@/components/LocationPicker";

type LinkItem = { href: string; label: string };

/**
 * Clean, premium white navbar — full-width, flat, with a subtle bottom hairline.
 * Layout mirrors a marketplace pattern: brand on the left, primary links next to it,
 * a location pill and a search pill in the middle, and the cart + actions on the right.
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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-5 lg:px-8">
      <div className="w-full px-3 sm:px-5 lg:px-6 h-14 flex items-center gap-3 lg:gap-5 rounded-full bg-white text-slate-900 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200">
        {/* Brand */}
        <div className="shrink-0">{brand}</div>

        {/* Desktop primary nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Location pill + Search pill */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl ml-auto">
          <LocationPicker variant="desktop" />

          <form
            action="/services"
            method="GET"
            role="search"
            className="flex-1 flex items-center gap-2 h-9 px-4 rounded-full bg-slate-100 ring-1 ring-slate-200 text-sm text-slate-700 focus-within:ring-slate-400 focus-within:bg-white transition"
          >
            <svg
              className="h-4 w-4 text-slate-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="Search for 'AC repair'"
              aria-label="Search services"
              autoComplete="off"
              className="flex-1 bg-transparent outline-none placeholder:text-slate-500 text-slate-900"
            />
          </form>
        </div>

        {/* Right-side actions: cart + profile/sign-in */}
        <div className="flex items-center gap-2 shrink-0">
          {cart}
          <div className="hidden lg:flex items-center gap-2">{desktopActions}</div>

          {/* Hamburger — small screens */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 hover:bg-slate-200/70 transition"
          >
            <svg
              width="20"
              height="20"
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
        <div className="lg:hidden mt-2 mx-3 sm:mx-5 lg:mx-8 rounded-2xl bg-white text-slate-900 ring-1 ring-slate-200 shadow-lg shadow-slate-900/10">
          <div className="w-full px-4 sm:px-6 py-4 flex flex-col gap-3">
            <LocationPicker variant="mobile" />
            <form
              action="/services"
              method="GET"
              role="search"
              onSubmit={() => setOpen(false)}
              className="flex items-center gap-2 h-11 px-4 rounded-full bg-slate-100 ring-1 ring-slate-200 text-sm text-slate-700 focus-within:ring-slate-400 focus-within:bg-white w-full transition"
            >
              <svg
                className="h-4 w-4 text-slate-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Search services"
                aria-label="Search services"
                autoComplete="off"
                className="flex-1 bg-transparent outline-none placeholder:text-slate-500 text-slate-900"
              />
            </form>
            <nav className="flex flex-col gap-0.5" onClick={() => setOpen(false)}>
              {links.map((l) => (
                <NavLink key={l.href} href={l.href}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2" onClick={() => setOpen(false)}>
              {mobileActions}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
