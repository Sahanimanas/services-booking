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

  const desktopActions = user ? (
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
