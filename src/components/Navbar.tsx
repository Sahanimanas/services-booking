import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import CartButton from "@/components/cart/CartButton";
import { BrandLogo } from "@/components/Logo";
import NavShell from "@/components/NavShell";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services & Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default async function Navbar() {
  const user = await getCurrentUser();

  const ProfileIcon = (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  );

  const iconButtonClass =
    "inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 hover:bg-slate-200/70 transition";

  const desktopActions = user ? (
    <>
      <Link href="/bookings" aria-label="My bookings" className={iconButtonClass}>
        {ProfileIcon}
      </Link>
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition"
        >
          Sign out
        </button>
      </form>
    </>
  ) : (
    <Link href="/login" aria-label="Sign in" className={iconButtonClass}>
      {ProfileIcon}
    </Link>
  );

  const mobileActions = user ? (
    <>
      <Link href="/bookings" className="btn-outline px-4 py-2.5 w-full text-center">
        My Bookings
      </Link>
      <form action="/api/auth/logout" method="POST" className="w-full">
        <button type="submit" className="btn-outline px-4 py-2.5 w-full">
          Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login" className="btn-outline px-4 py-2.5 w-full text-center">
        Sign in
      </Link>
      <Link href="/services" className="btn-primary px-5 py-2.5 w-full text-center">
        Book Now
      </Link>
    </>
  );

  return (
    <NavShell
      brand={<BrandLogo compact />}
      links={LINKS}
      cart={<CartButton />}
      desktopActions={desktopActions}
      mobileActions={mobileActions}
    />
  );
}
