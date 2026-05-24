import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveDiscountPct, effectiveUnitCents } from "@/lib/pricing";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

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
      {/* Hero */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal variant="left">
            <span className="chip-off mb-5">★ Trusted by 10,000+ households</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
              Expert Home Services. <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Trusted Professionals.
              </span>
            </h1>
            <p className="mt-5 text-lg text-ink-900/70 max-w-xl">
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
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink-900/70">
              <span>★ 5-Star Rated</span>
              <span>🛡️ Licensed & Insured</span>
              <span>📅 Same-Day Appointments</span>
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <div className="relative group">
              <div className="relative card p-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200"
                  alt="GSM technician at work"
                  className="aspect-[4/3] w-full rounded-2xl object-cover zoom-on-hover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
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
              <div className="text-3xl font-extrabold bg-brand-gradient bg-clip-text text-transparent">
                {s.k}
              </div>
              <div className="text-sm text-ink-900/60 mt-1">{s.v}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Our Services</h2>
            <p className="text-ink-900/60 mt-2">
              Professional home maintenance delivered by certified experts
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <Link
                href={`/services?cat=${c.slug}`}
                className="card p-5 text-center group transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-200 block"
              >
                <div className="icon-tile w-12 h-12 mx-auto rounded-xl bg-brand-gradient flex items-center justify-center text-white text-xl">
                  {iconFor(c.slug)}
                </div>
                <div className="mt-3 font-semibold text-sm">{c.name}</div>
                <div className="text-xs text-ink-900/50 mt-1">
                  {c._count.services} services
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Popular services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Popular Services</h2>
          <Link href="/services" className="text-brand-600 font-semibold hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="text-xs text-brand-600 font-semibold uppercase tracking-wide">
                    {s.category.name}
                  </div>
                  <div className="font-bold mt-1 group-hover:text-brand-700">{s.title}</div>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-xl font-bold text-ink-900">{rupees(unitCents)}</span>
                    {pct > 0 && (
                      <span className="text-sm text-ink-900/40 line-through">
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

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal variant="scale">
          <div className="rounded-3xl bg-slate-900 text-white p-10 lg:p-14 grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-bold">Need help with a home service today?</h3>
              <p className="text-white/70 mt-2">
                Tell us what you need and we'll connect you with a verified pro in your locality.
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
      </section>
    </>
  );
}

function iconFor(slug: string) {
  switch (slug) {
    case "ac": return "❄️";
    case "ro": return "💧";
    case "washing-machine": return "🧺";
    case "refrigerator": return "🧊";
    case "plumbing": return "🔧";
    case "electrician": return "⚡";
    default: return "🛠️";
  }
}
