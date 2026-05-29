import Reveal from "@/components/Reveal";
import { PhoneIcon, EnvelopeIcon, BuildingIcon, LocationIcon } from "@/components/Icons";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Global Service Mitra (a unit of Global Service Mitra Private Limited) — our team is ready to help.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative -mt-[4.75rem] bg-brand-gradient">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-40 pb-20 text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
              Contact Us
            </h1>
            <p className="mt-3 text-white/80">
              We are here to help! Get in touch with our team.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Head office */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <Reveal>
          <div className="card p-6 group transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="icon-tile w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700">
              <BuildingIcon />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Head Office — Patna</h3>
            <div className="mt-2 text-slate-700">
              <div className="flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">
                  <LocationIcon />
                </span>
                <div>
                  <div className="font-semibold">Global Service Mitra</div>
                  <div className="text-sm text-slate-500">
                    A unit of Global Service Mitra Private Limited
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Laxmi Palace, 1st Floor 103, Boring Road, Patna, Bihar, India
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Contact methods */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 grid sm:grid-cols-2 gap-6 pb-16">
        <Reveal variant="left">
          <div className="card p-6 flex items-center gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="icon-tile w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
              <PhoneIcon />
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Call us directly</div>
              <a
                href="tel:+919801126444"
                className="text-slate-900 font-bold text-lg underline-grow"
              >
                +91 98011 26444
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal variant="right" delay={100}>
          <div className="card p-6 flex items-center gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl ">
            <div className="icon-tile w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
              <EnvelopeIcon />
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Send a message</div>
              <a
                href="mailto:support@globalservicemitra.com"
                className="text-slate-900 font-bold text-lg underline-grow break-all"
              >
                info@globalservicemitra.com
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
