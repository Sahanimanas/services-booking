import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import CartButton from "@/components/cart/CartButton";
import { BrandLogo } from "@/components/Logo";

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo compact />

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/services">Services & Products</NavLink>
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
          {user ? (
            <>
              <Link href="/bookings" className="hidden sm:inline-flex btn-ghost px-4 py-2">
                My Bookings
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="btn-outline px-4 py-2">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-4 py-2 hidden sm:inline-flex">
                Sign in
              </Link>
              <Link href="/services" className="btn-primary px-5 py-2.5">
                Book Now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium text-ink-900/80 hover:text-brand-700 hover:bg-brand-50 transition"
    >
      {children}
    </Link>
  );
}
