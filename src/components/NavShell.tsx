"use client";

import { useEffect, useState } from "react";

/**
 * Floating navbar shell. Transparent while at the top of the page (so a hero
 * video/image shows through behind it), then fades to a glassy white rounded
 * pill once the user scrolls — which keeps the links legible as content
 * scrolls underneath.
 */
export default function NavShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 sm:px-5 lg:px-8 pt-3">
      <div
        className={
          "max-w-screen-2xl mx-auto rounded-2xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-colors duration-300 " +
          (scrolled
            ? "bg-white/85 backdrop-blur ring-1 ring-slate-200 shadow-soft"
            : "bg-transparent")
        }
      >
        {children}
      </div>
    </header>
  );
}
