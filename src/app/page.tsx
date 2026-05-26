import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveDiscountPct, effectiveUnitCents } from "@/lib/pricing";
import Reveal from "@/components/Reveal";
import CategoryIcon from "@/components/CategoryIcon";

export const revalidate = 60;

// Public-domain / Unsplash-licensed servicing photos.
// Unsplash license allows free commercial use without attribution.
const SERVICE_TILES = [
  {
    src: "https://images.unsplash.com/photo-1631545806609-44f56f9b56b7?w=900&q=80",
    label: "AC Repair",
  },
  {
    src: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=900&q=80",
    label: "Refrigerator",
  },
  {
    src: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=900&q=80",
    label: "Washing Machine",
  },
  {
    src: "https://images.unsplash.com/photo-1607435097405-db48f377bff6?w=900&q=80",
    label: "Plumbing",
  },
  {
    src: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=900&q=80",
    label: "Electrician",
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
      {/* Hero — full-bleed with servicing background */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=2400&q=80"
          alt="A professional technician at work"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Light wash so the white-styled foreground stays legible */}
        <div className="absolute inset-0 -z-10 bg-white/85 backdrop-blur-sm" />

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="left">
            <span className="chip-off mb-5">★ Trusted by 10,000+ households</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
              Expert Home Services. <br />
              <span className="text-accent-500">
                Trusted Professionals.
              </span>
            </h1>
            <p className="mt-5 text-lg text-slate-700 max-w-xl">
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
          <Reveal variant="right" delay={120}>
            <div className="relative group">
              <div className="relative card p-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80"
                  alt="GSM technician at work"
                  className="aspect-[4/3] w-full rounded-2xl object-cover zoom-on-hover"
                />
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SERVICE_TILES.map((t, i) => (
              <Reveal key={t.label} delay={i * 60}>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden group ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.src}
                    alt={t.label}
                    className="absolute inset-0 w-full h-full object-cover zoom-on-hover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-sm">
                    {t.label}
                  </div>
                </div>
              </Reveal>
            ))}
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

