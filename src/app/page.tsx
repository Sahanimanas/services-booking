import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveDiscountPct, effectiveUnitCents } from "@/lib/pricing";
import Reveal from "@/components/Reveal";
import CategoryIcon from "@/components/CategoryIcon";

export const revalidate = 60;

// Public-domain / Unsplash-licensed servicing photos.
// Unsplash license allows free commercial use without attribution.
const SERVICE_HIGHLIGHTS = [
  {
    slug: "ac",
    label: "AC Repair & Service",
    src: "https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?w=1200&q=80",
    blurb:
      "Cooling not what it used to be? Our technicians handle installation, gas refilling, and deep servicing for split and window ACs — so your home stays comfortable through the hottest months.",
    points: ["Split & window AC", "Gas refilling & leak fix", "Annual maintenance plans"],
  },
  {
    slug: "refrigerator",
    label: "Refrigerator Repair",
    src: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200&q=80",
    blurb:
      "From cooling failures to strange noises, we diagnose and fix single-door, double-door, and side-by-side refrigerators of every brand — fast, so your food stays fresh.",
    points: ["All brands & models", "Compressor & thermostat", "Same-day diagnosis"],
  },
  {
    slug: "washing-machine",
    label: "Washing Machine Repair",
    src: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=1200&q=80",
    blurb:
      "Drum not spinning or water not draining? We service top-load, front-load, and semi-automatic machines, replacing worn parts with genuine components.",
    points: ["Top & front load", "Drainage & spin issues", "Genuine spare parts"],
  },
  {
    slug: "plumbing",
    label: "Plumbing Services",
    src: "https://images.unsplash.com/photo-1607435097405-db48f377bff6?w=1200&q=80",
    blurb:
      "Leaky taps, blocked drains, or a full bathroom fit-out — our plumbers arrive equipped to solve it cleanly the first time, with no mess left behind.",
    points: ["Leak & blockage fixes", "Tap & fitting installs", "Kitchen & bath plumbing"],
  },
  {
    slug: "electrician",
    label: "Electrician Services",
    src: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80",
    blurb:
      "Faulty switches, tripping circuits, or new wiring — our licensed electricians work safely to code, keeping your home powered and protected.",
    points: ["Wiring & switchboards", "Fault & short-circuit fix", "Safety-first, to code"],
  },
];

// Per-card colour palette for the category tiles (cycled by index).
const CATEGORY_TILES = [
  "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
  "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  "bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
  "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
  "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
];

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { services: true } } },
  });
  const popularServices = await prisma.service.findMany({
    where: { active: true },
    take: 6,
    orderBy: { createdAt: "asc" },
    include: { category: true },
  });

  return (
    <>
      {/* Hero — left copy + right image collage (Urban Company style) */}
      <section className="relative isolate overflow-hidden min-h-screen flex items-center -mt-[5rem] bg-gradient-to-br from-white via-slate-50 to-orange-50/40">
        {/* soft decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-500/10 blur-3xl"
        />

        <div className="relative max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-32 pb-16">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
            <div className="relative">
              {/* Decorative backdrop behind the text */}
              {/* Dot-grid pattern, top-left */}
              <div
                aria-hidden="true"
                className="hero-dot-grid pointer-events-none absolute -top-6 -left-4 w-44 h-44 opacity-50"
              />
              {/* Soft glow halo behind the headline */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-24 -left-10 w-80 h-80 rounded-full bg-gradient-to-br from-accent-500/15 via-rose-400/10 to-amber-400/15 blur-3xl"
              />
              {/* Decorative sparkles */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-2 right-6 sm:right-16 w-8 h-8 text-accent-500/70 animate-pulse"
                fill="currentColor"
              >
                <path d="M12 0l2.4 7.6L22 10l-7.6 2.4L12 20l-2.4-7.6L2 10l7.6-2.4z" />
              </svg>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-44 -left-2 w-5 h-5 text-rose-400/60"
                fill="currentColor"
              >
                <path d="M12 0l2.4 7.6L22 10l-7.6 2.4L12 20l-2.4-7.6L2 10l7.6-2.4z" />
              </svg>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute bottom-20 right-12 w-6 h-6 text-amber-400/60"
                fill="currentColor"
              >
                <path d="M12 0l2.4 7.6L22 10l-7.6 2.4L12 20l-2.4-7.6L2 10l7.6-2.4z" />
              </svg>
              {/* Curved swoosh line */}
              <svg
                aria-hidden="true"
                viewBox="0 0 400 200"
                className="pointer-events-none absolute -bottom-4 -left-6 w-72 h-36 opacity-50"
                fill="none"
              >
                <path
                  d="M 10 180 Q 100 60 200 120 T 380 40"
                  stroke="url(#hero-swoosh)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 8"
                />
                <defs>
                  <linearGradient id="hero-swoosh" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgb(249,115,22)" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="rgb(244,63,94)" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Small floating accent ring */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-10 -right-2 w-16 h-16 rounded-full border-2 border-dashed border-accent-400/40 animate-[spin_18s_linear_infinite]"
              />

              <Reveal variant="left" className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 shadow-sm mb-6">
                  <span className="text-accent-500">★</span> Trusted by 10,000+ households
                </span>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                  Home services <br />
                  at your{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-accent-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                      doorstep
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-2 h-2 bg-gradient-to-r from-accent-500/30 via-rose-500/30 to-amber-500/30 rounded-full blur-sm"
                    />
                  </span>
                </h1>
                <p className="mt-6 text-lg text-slate-600 max-w-xl">
                  Verified professionals, transparent pricing, and same-day appointments — book the
                  right pro for your home in minutes.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/services" className="btn-primary shadow-lg shadow-slate-900/10">
                    Book a Service
                  </Link>
                  <Link href="/contact" className="btn-outline">
                    Speak with Specialist
                  </Link>
                </div>
                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-amber-500">★</span> 5-Star Rated
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span>🛡️</span> Licensed &amp; Insured
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span>📅</span> Same-Day Appointments
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal variant="right">
              <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                {/* Tall left column */}
                <div className="space-y-3 sm:space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/1.jpeg"
                    alt="Home service"
                    className="aspect-[4/5] w-full rounded-3xl object-cover ring-1 ring-slate-200 shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition duration-500"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/2.jpeg"
                    alt="Home service"
                    className="aspect-square w-full rounded-3xl object-cover ring-1 ring-slate-200 shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition duration-500"
                  />
                </div>
                {/* Right column */}
                <div className="space-y-3 sm:space-y-4 pt-8 sm:pt-12">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/3.jpeg"
                    alt="Home service"
                    className="aspect-square w-full rounded-3xl object-cover ring-1 ring-slate-200 shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition duration-500"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/4.jpeg"
                    alt="Home service"
                    className="aspect-[4/5] w-full rounded-3xl object-cover ring-1 ring-slate-200 shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition duration-500"
                  />
                </div>

                {/* Floating rating badge */}
                <div className="absolute -left-4 sm:-left-6 bottom-6 sm:bottom-10 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200 px-4 py-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-rose-500 text-white text-lg font-bold shadow-md">
                    ★
                  </div>
                  <div className="leading-tight">
                    <div className="text-lg font-extrabold text-slate-900">4.8</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      12M+ Bookings
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { k: "500+", v: "Pros Verified" },
            { k: "50k+", v: "Bookings" },
            { k: "4.8★", v: "Avg Rating" },
            { k: "24/7", v: "Support" },
          ].map((s, i) => (
            <Reveal
              key={s.v}
              variant="up"
              delay={i * 80}
              className="card p-6 text-center hover:-translate-y-1 hover:shadow-xl transition duration-300"
            >
              <div className="text-3xl font-extrabold text-accent-500">
                {s.k}
              </div>
              <div className="text-sm text-slate-600 mt-1">{s.v}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured service cards — Electrician / AC Repair / Refrigerator */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-16">
        <Reveal>
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-accent-600">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> Most Booked
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                Top picks this season
              </h2>
              <p className="text-slate-600 mt-1.5 max-w-lg">
                Trusted technicians for the services your home needs most.
              </p>
            </div>
            <Link
              href="/services"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View all services <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              slug: "electrician",
              label: "Electrician",
              tagline: "Wiring, switches, repairs",
              blurb:
                "Licensed electricians for fan installs, switchboard fixes, short-circuits, and full wiring jobs — safely, to code.",
              priceFrom: "₹199",
              src: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M13 2L4.5 13h6l-1 9 8.5-11h-6l1-9z" />
                </svg>
              ),
              gradient: "from-amber-400 to-orange-500",
              features: ["Same-day", "Licensed", "30-day warranty"],
            },
            {
              slug: "ac",
              label: "AC Repair & Service",
              tagline: "Split, window & central",
              blurb:
                "Cooling not working? Gas refill, deep cleaning, installation and AMC plans — for every brand and model.",
              priceFrom: "₹449",
              src: "https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?w=1200&q=80",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="2" y="5" width="20" height="9" rx="2" />
                  <path d="M6 18l-1.5 3M12 18v3M18 18l1.5 3M5 9h14" />
                </svg>
              ),
              gradient: "from-sky-400 to-blue-600",
              features: ["All brands", "Genuine parts", "Free inspection"],
            },
            {
              slug: "refrigerator",
              label: "Refrigerator Repair",
              tagline: "Single, double & side-by-side",
              blurb:
                "From cooling failures to strange noises — quick diagnosis and same-day fixes so your food stays fresh.",
              priceFrom: "₹349",
              src: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200&q=80",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="6" y="2" width="12" height="20" rx="2" />
                  <path d="M6 10h12M9 6v2M9 14v2" />
                </svg>
              ),
              gradient: "from-emerald-400 to-teal-600",
              features: ["Same-day fix", "All brands", "Compressor expert"],
            },
          ].map((card, i) => (
            <Reveal key={card.slug} delay={i * 90}>
              <Link
                href={`/services?cat=${card.slug}`}
                className="group block relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/15"
              >
                {/* Image */}
                <div className="relative aspect-[5/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.src}
                    alt={card.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

                  {/* Icon badge top-left */}
                  <div
                    className={
                      "absolute top-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br " +
                      card.gradient
                    }
                  >
                    {card.icon}
                  </div>

                  {/* Price chip top-right */}
                  <div className="absolute top-4 right-4 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
                    From <span className="text-accent-600">{card.priceFrom}</span>
                  </div>

                  {/* Label on image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                      {card.tagline}
                    </div>
                    <div className="text-2xl font-extrabold leading-tight mt-0.5">
                      {card.label}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-sm text-slate-600 line-clamp-2">{card.blurb}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {card.features.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3 text-emerald-500"
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="text-amber-500">★★★★★</span>
                      <span className="font-semibold text-slate-700">4.8</span>
                      <span>·</span>
                      <span>2k+ jobs</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 group-hover:text-accent-600 transition">
                      Book now
                      <span
                        aria-hidden
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Our Services</h2>
            <p className="text-slate-600 mt-2">
              Professional home maintenance delivered by certified experts
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link
                href={`/services?cat=${c.slug}`}
                className="card p-5 text-center group transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 block"
              >
                <div
                  className={
                    "w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition duration-300 " +
                    CATEGORY_TILES[i % CATEGORY_TILES.length]
                  }
                >
                  <CategoryIcon slug={c.slug} className="w-6 h-6" />
                </div>
                <div className="mt-3 font-semibold text-sm">{c.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {c._count.services} services
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Image strip — "real work, every day" */}
      <section className="relative isolate overflow-hidden bg-slate-200 border-y border-slate-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold">Real work. Real homes.</h2>
              <p className="text-slate-600 mt-2">
                Verified pros doing the job right — every appointment, every locality.
              </p>
            </div>
          </Reveal>
          <div className="space-y-14 lg:space-y-20">
            {SERVICE_HIGHLIGHTS.map((s, i) => {
              const reversed = i % 2 === 1;
              return (
                <Reveal key={s.slug} variant={reversed ? "right" : "left"}>
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Image */}
                    <div
                      className={
                        "relative aspect-[16/10] rounded-3xl overflow-hidden ring-1 ring-slate-200 shadow-soft group " +
                        (reversed ? "lg:order-2" : "")
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.src}
                        alt={s.label}
                        className="absolute inset-0 w-full h-full object-cover zoom-on-hover"
                      />
                    </div>

                    {/* Text */}
                    <div className={reversed ? "lg:order-1" : ""}>
                      <span
                        className={
                          "inline-flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white " +
                          (i % 2 === 0 ? "bg-brand-600" : "bg-accent-500")
                        }
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900">
                        {s.label}
                      </h3>
                      <p className="mt-3 text-slate-600 max-w-xl">{s.blurb}</p>
                      <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {s.points.map((p) => (
                          <li key={p} className="flex items-center gap-2 text-slate-700">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600 text-xs font-bold">
                              ✓
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/services?cat=${s.slug}`}
                        className="mt-6 inline-flex btn-outline px-5 py-2.5"
                      >
                        Explore {s.label} →
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Popular Services</h2>
          <Link href="/services" className="text-slate-700 font-semibold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularServices.map((s, i) => {
            const pct = effectiveDiscountPct(s);
            const unitCents = effectiveUnitCents(s);
            return (
              <Reveal key={s.id} delay={i * 90}>
                <Link href={`/services/${s.slug}`} className="card-interactive group block">
                  <div className="relative aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.imageUrl ?? "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900"}
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover zoom-on-hover"
                    />
                    {pct > 0 && (
                      <span className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {pct}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                      {s.category.name}
                    </div>
                    <div className="font-bold mt-1 group-hover:text-slate-900">{s.title}</div>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-xl font-bold text-slate-900">{rupees(unitCents)}</span>
                      {pct > 0 && (
                        <span className="text-sm text-slate-400 line-through">
                          {rupees(s.priceCents)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CTA — full-bleed with imagery */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=2400&q=80"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-slate-900/80" />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-20 text-white">
          <Reveal variant="scale">
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <h3 className="text-3xl sm:text-4xl font-bold">
                  Need help with a home service today?
                </h3>
                <p className="text-white/75 mt-2 max-w-2xl">
                  Tell us what you need and we'll connect you with a verified pro in your
                  locality.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
                <Link
                  href="/services"
                  className="btn bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] transition"
                >
                  Browse Services
                </Link>
                <Link
                  href="/contact"
                  className="btn border border-white/40 text-white hover:bg-white/10 hover:scale-[1.02] transition"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

