import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink-900 text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <LogoMark size={40} />
            <div className="leading-tight">
              <div className="font-extrabold text-lg">
                Global Service <span className="text-accent-400">Mitra</span>
              </div>
              <div className="text-[9px] font-semibold text-white/60 tracking-[0.18em] uppercase">
                Service · Support · Solutions
              </div>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Trusted support. Smart solutions. Stronger together — book verified professionals for
            every home service.
          </p>
          <Link href="/services" className="mt-5 inline-flex btn-accent px-5 py-2.5">
            Request A Service →
          </Link>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-slate-300">Quick Links</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/bookings" className="hover:text-white">My Bookings</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-slate-300">Popular Services</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link href="/services?cat=ac" className="hover:text-white">AC Repair</Link></li>
            <li><Link href="/services?cat=ro" className="hover:text-white">RO Service</Link></li>
            <li><Link href="/services?cat=washing-machine" className="hover:text-white">Washing Machine</Link></li>
            <li><Link href="/services?cat=refrigerator" className="hover:text-white">Refrigerator</Link></li>
            <li><Link href="/services?cat=plumbing" className="hover:text-white">Plumbing</Link></li>
            <li><Link href="/services?cat=electrician" className="hover:text-white">Electrician</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-slate-300">Contact Us</h4>
          <ul className="space-y-3 text-white/70 text-sm">
            <li>📞 +91 98011 26444</li>
            <li>✉️ support@globalservicemitra.com</li>
            <li>📍 Laxmi Palace, Boring Road, Patna, Bihar</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-white/50 text-xs">
        © {new Date().getFullYear()} Global Service Mitra · A unit of Global Service Mitra Private
        Limited · All rights reserved
      </div>
    </footer>
  );
}
