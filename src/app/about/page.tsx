import Reveal from "@/components/Reveal";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description:
    "Global Service Mitra (a unit of Global Service Mitra Private Limited) — a professional home and technical service company delivering reliable, affordable, high-quality solutions.",
};

const coreValues = [
  ["Customer Satisfaction", "Your happiness is our success metric."],
  ["Professional Service", "Courteous, uniformed, on-time technicians."],
  ["Transparency & Trust", "Clear pricing, no hidden charges."],
  ["Fast Response", "Quick allocation and doorstep arrival."],
  ["Skilled Workforce", "Trained, verified, experienced hands."],
  ["Quality Commitment", "Work backed by service warranty."],
];

const whyChooseUs = [
  "Trained & Verified Technicians",
  "Fast Doorstep Service",
  "Affordable Pricing",
  "Professional Customer Support",
  "Service Warranty Support",
  "Smart Digital Service Process",
  "Emergency Support Availability",
];

const targetCustomers = [
  "Residential Homes",
  "Apartments & Societies",
  "Schools & Colleges",
  "Offices & Commercial Spaces",
  "Shops & Showrooms",
  "Hospitals & Clinics",
  "Small Businesses",
];

const strengths = [
  "Professional Branding",
  "Multi-Service Capability",
  "Skilled Technical Team",
  "Scalable Business Model",
  "Customer-Centric Operations",
  "Strong Local Market Potential",
];

export default function AboutPage() {
  return (
    <>
      {/* Hero — brand gradient, extends up behind the glass navbar */}
      <section className="relative -mt-[4.75rem] bg-brand-gradient">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-16 text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
              About Global Service Mitra
            </h1>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              Smart Solutions for Every Home — reliable, affordable home and technical services for
              residential, commercial, and institutional customers.
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">
              A unit of Global Service Mitra Private Limited
            </p>
          </Reveal>
        </div>
      </section>

      {/* Who We Are — white */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal variant="left">
            <span className="chip-off">Who We Are</span>
            <h2 className="mt-4 text-3xl font-bold">
              We don&apos;t just fix homes — we elevate them.
            </h2>
            <p className="mt-4 text-ink-900/70">
              Global Service Mitra is a professional home and technical service company committed to
              delivering reliable, affordable, and high-quality solutions for residential,
              commercial, and institutional customers.
            </p>
            <p className="mt-4 text-ink-900/70">
              We specialize in appliance repair, electrical services, plumbing, RO services, air
              conditioning solutions, CCTV installation, and facility management support. With
              trained technicians, professional customer support, and a customer-first approach, we
              aim to become one of India&apos;s most trusted service brands.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                ["Verified Pros", "Background-checked", "border-brand-500"],
                ["Fast Doorstep Service", "Wherever possible", "border-accent-500"],
                ["Transparent Pricing", "No surprises", "border-accent-500"],
                ["Service Warranty", "On all service work", "border-brand-500"],
              ].map(([t, s, border]) => (
                <div
                  key={t}
                  className={
                    "card p-4 border-l-4 " +
                    border +
                    " transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  }
                >
                  <div className="font-semibold">{t}</div>
                  <div className="text-sm text-ink-900/60">{s}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <div className="card p-2 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200"
                alt="Global Service Mitra technician at work"
                className="aspect-[4/3] w-full rounded-2xl object-cover zoom-on-hover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission & Vision — light blue band */}
      <section className="bg-brand-50 border-y border-brand-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <div className="grid md:grid-cols-2 gap-4">
            <Reveal className="card p-8 border-t-4 border-brand-600 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="chip-off">Our Mission</div>
              <p className="mt-4 text-lg text-slate-700">
                To provide smart, reliable, and professional services at customers&apos; doorsteps
                while building long-term trust and satisfaction.
              </p>
            </Reveal>
            <Reveal
              delay={120}
              className="card p-8 border-t-4 border-accent-500 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="chip-off">Our Vision</div>
              <p className="mt-4 text-lg text-slate-700">
                To become a leading nationwide service company known for quality, transparency,
                technology, and customer satisfaction.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core Values — white, alternating accent borders */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <Reveal>
            <h2 className="text-3xl font-bold text-slate-900">Our Core Values</h2>
            <p className="mt-2 text-slate-600">The principles behind every service we deliver.</p>
          </Reveal>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreValues.map(([t, s], i) => (
              <Reveal
                key={t}
                delay={i * 70}
                className={
                  "card p-6 border-l-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl " +
                  (i % 2 === 0 ? "border-brand-500" : "border-accent-500")
                }
              >
                <div className="text-slate-900 font-semibold">{t}</div>
                <div className="text-slate-600 mt-2 text-sm">{s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us — light orange band */}
      <section className="bg-accent-50 border-y border-accent-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <Reveal>
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Us</h2>
          </Reveal>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {whyChooseUs.map((item, i) => (
              <Reveal
                key={item}
                delay={i * 60}
                className="card p-4 flex items-center gap-3 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white text-sm font-bold">
                  ✓
                </span>
                <span className="text-slate-700 font-medium">{item}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve — white, brand-tinted pills */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <Reveal>
            <h2 className="text-3xl font-bold text-slate-900">Who We Serve</h2>
            <p className="mt-2 text-slate-600">
              Trusted by homes, businesses, and institutions across the region.
            </p>
          </Reveal>
          <div className="mt-6 flex flex-wrap gap-3">
            {targetCustomers.map((c, i) => (
              <Reveal key={c} delay={i * 50}>
                <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
                  {c}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Company Strengths — light blue band */}
      <section className="bg-brand-50 border-y border-brand-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <Reveal>
            <h2 className="text-3xl font-bold text-slate-900">Company Strengths</h2>
          </Reveal>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strengths.map((s, i) => (
              <Reveal
                key={s}
                delay={i * 70}
                className="card p-6 border-l-4 border-brand-500 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-slate-900 font-semibold">{s}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA — bold brand gradient */}
      <section className="bg-brand-gradient">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 text-center text-white">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Smart Solutions for Every Home</h2>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              We look forward to serving you with professionalism, trust, and smart service
              solutions.
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center rounded-full bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-white/90"
            >
              Book a Service →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
