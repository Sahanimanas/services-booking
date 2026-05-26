import Reveal from "@/components/Reveal";
import { PhoneIcon, EnvelopeIcon, BuildingIcon, LocationIcon } from "@/components/Icons";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Global Service Mitra — our team is ready to help.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 text-center">
          <Reveal>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Contact Us</h1>
            <p className="mt-3 text-slate-600">
              We are here to help! Get in touch with our team across our locations.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 grid md:grid-cols-2 gap-6">
        <Reveal variant="left">
          <OfficeCard
            city="Kolkata Office"
            line1="Global Service Mitra Services Pvt. Ltd."
            line2="1409, Anandapur Road, Kolkata – 700107"
          />
        </Reveal>
        <Reveal variant="right" delay={100}>
          <OfficeCard
            city="Patna Office"
            line1="Global Service Mitra Branch Office"
            line2="402, Boring Canal Road, Patna – 800001"
          />
        </Reveal>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 grid md:grid-cols-2 gap-6 pb-16">
        <div className="card p-6 flex items-center gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="icon-tile w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
            <PhoneIcon />
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Call us directly</div>
            <a
              href="tel:+917061777111"
              className="text-slate-900 font-bold text-lg underline-grow"
            >
              +91 70617 77111
            </a>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="icon-tile w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 shrink-0">
            <EnvelopeIcon />
          </div>
          <div>
            <div className="text-xs uppercase text-slate-500">Send a message</div>
            <a
              href="mailto:support@globalservicemitra.in"
              className="text-slate-900 font-bold text-lg underline-grow"
            >
              support@globalservicemitra.in
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function OfficeCard({ city, line1, line2 }: { city: string; line1: string; line2: string }) {
  return (
    <div className="card p-6 group transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="icon-tile w-12 h-12 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700">
        <BuildingIcon />
      </div>
      <h3 className="mt-4 text-xl font-bold text-slate-900">{city}</h3>
      <div className="mt-2 text-slate-700">
        <div className="flex items-start gap-2">
          <span className="text-slate-500 mt-0.5">
            <LocationIcon />
          </span>
          <div>
            <div className="font-semibold">{line1}</div>
            <div className="text-sm text-slate-600">{line2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
