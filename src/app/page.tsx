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
      {/* Hero — full-screen video background */}
      <section className="relative isolate overflow-hidden min-h-screen -mt-[4.75rem] flex items-center">
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/hero-vid.mp4" type="video/mp4" />
        </video>
        {/* Minimal left-weighted wash — video stays clear; a soft text-halo keeps the heading legible */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/75 via-white/30 to-transparent" />

        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-16">
          <Reveal variant="left" className="max-w-2xl">
            <span className="chip-off mb-5">★ Trusted by 10,000+ households</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 [text-shadow:0_2px_18px_rgba(255,255,255,0.9)]">
              Expert Home Services. <br />
              <span className="text-accent-500">
                Trusted Professionals.
              </span>
            </h1>
            <p className="mt-5 text-lg text-slate-700 max-w-xl [text-shadow:0_1px_12px_rgba(255,255,255,0.95)]">
              Reliable repairs, certified technicians, and same-day appointments — book the right
              pro for your home in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="btn-primary">
                Book a Service
              </Link>
              <Link href="/contact" className="btn-outline">
                Speak with Specialist
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-700">
              <span>★ 5-Star Rated</span>
              <span>🛡️ Licensed &amp; Insured</span>
              <span>📅 Same-Day Appointments</span>
            </div>
          </Reveal>
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
                <div className="icon-tile w-12 h-12 mx-auto rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 group-hover:border-slate-400 group-hover:text-slate-900 transition">
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
      <section className="relative isolate overflow-hidden bg-slate-50 border-y border-slate-200">
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

