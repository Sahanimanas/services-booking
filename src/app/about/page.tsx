import Reveal from "@/components/Reveal";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Global Service Mitra — our mission to make trusted home services accessible to every household.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
              About{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Global Service Mitra
              </span>
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              We're elevating home services by connecting households with skilled, vetted
              professionals.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal variant="left">
          <span className="chip-off">About Global Service Mitra</span>
          <h2 className="mt-4 text-3xl font-bold">
            We don't just fix homes — we elevate them.
          </h2>
          <p className="mt-4 text-ink-900/70">
            Since our founding, Global Service Mitra has been a trusted partner for households of
            all sizes — from quick repairs to comprehensive maintenance. Every technician is
            background-checked, trained and rated by real customers like you.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              ["Verified Pros", "Background-checked"],
              ["Same-Day Service", "Wherever possible"],
              ["Transparent Pricing", "No surprises"],
              ["30-Day Warranty", "On all service work"],
            ].map(([t, s]) => (
              <div
                key={t}
                className="card p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
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
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { k: "Mission", v: "Make trusted home services accessible to every Indian household." },
            { k: "Vision", v: "Be the most loved home services platform in the country." },
            { k: "Values", v: "Honesty, craftsmanship, and customer-first thinking." },
            { k: "Team", v: "200+ technicians, designers and engineers." },
          ].map((b, i) => (
            <Reveal
              key={b.k}
              delay={i * 90}
              className="card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-slate-900 font-semibold">{b.k}</div>
              <div className="text-slate-600 mt-2 text-sm">{b.v}</div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
