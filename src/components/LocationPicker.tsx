"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "gsm_locality_v1";

type Locality = {
  id: string;
  name: string;
  city: string;
  pincode: string | null;
};

type Stored = { id: string; label: string };

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function writeStored(value: Stored | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function LocationPicker({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const [localities, setLocalities] = useState<Locality[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Stored | null>(null);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Hydrate from localStorage; fall back to IP-based auto-detection
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setSelected(stored);
      return;
    }
    let cancelled = false;
    fetch("/api/localities/auto")
      .then((r) => r.json())
      .then((d: { locality: Locality | null }) => {
        if (cancelled || !d.locality) return;
        const label = `${d.locality.name}, ${d.locality.city}`;
        const value: Stored = { id: d.locality.id, label };
        setSelected(value);
        writeStored(value);
      })
      .catch(() => {
        /* silent — user can still pick manually */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch list lazily on first open
  useEffect(() => {
    if (!open || localities !== null || loading) return;
    setLoading(true);
    fetch("/api/localities")
      .then((r) => r.json())
      .then((d: { localities: Locality[] }) => setLocalities(d.localities ?? []))
      .catch(() => setLocalities([]))
      .finally(() => setLoading(false));
  }, [open, localities, loading]);

  // Click-outside + escape to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!localities) return [];
    const q = query.trim().toLowerCase();
    if (!q) return localities;
    return localities.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        (l.pincode ?? "").toLowerCase().includes(q)
    );
  }, [localities, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Locality[]>();
    for (const l of filtered) {
      if (!map.has(l.city)) map.set(l.city, []);
      map.get(l.city)!.push(l);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handlePick = (l: Locality) => {
    const label = `${l.name}, ${l.city}`;
    const stored: Stored = { id: l.id, label };
    setSelected(stored);
    writeStored(stored);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setSelected(null);
    writeStored(null);
  };

  const triggerClasses =
    variant === "desktop"
      ? "group inline-flex items-center gap-2 h-9 px-4 rounded-full bg-slate-100 ring-1 ring-slate-200 text-sm text-slate-700 hover:bg-slate-200/70 transition min-w-[180px] max-w-[260px]"
      : "inline-flex items-center gap-2 h-11 px-4 rounded-full bg-slate-100 ring-1 ring-slate-200 text-sm text-slate-700 w-full";

  return (
    <div ref={rootRef} className={variant === "desktop" ? "relative" : "relative w-full"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        className={triggerClasses}
      >
        <svg
          className="h-4 w-4 text-slate-500 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="truncate font-medium">
          {selected ? selected.label : "Select your location"}
        </span>
        <svg
          className={
            "h-4 w-4 text-slate-400 ml-auto shrink-0 transition-transform " +
            (open ? "rotate-180" : "")
          }
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className={
            "absolute z-50 mt-2 rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden " +
            (variant === "desktop" ? "left-0 w-[320px]" : "left-0 right-0 w-full")
          }
        >
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search area, city, pincode"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {loading && (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">Loading…</div>
            )}
            {!loading && localities !== null && filtered.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">
                {localities.length === 0 ? "No service areas yet." : "No matches."}
              </div>
            )}
            {!loading &&
              grouped.map(([city, items]) => (
                <div key={city} className="py-1">
                  <div className="px-4 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">
                    {city}
                  </div>
                  {items.map((l) => {
                    const active = selected?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handlePick(l)}
                        className={
                          "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition " +
                          (active
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-slate-50")
                        }
                      >
                        <span className="truncate">
                          <span className="font-medium">{l.name}</span>
                          {l.pincode && (
                            <span
                              className={
                                "ml-2 text-xs " +
                                (active ? "text-white/70" : "text-slate-400")
                              }
                            >
                              {l.pincode}
                            </span>
                          )}
                        </span>
                        {active && (
                          <svg
                            className="h-4 w-4 shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>

          {selected && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-t border-slate-100 transition"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
