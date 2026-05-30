"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps the customer-facing Navbar + Footer around page content, but hides them
 * entirely on /admin routes (which have their own panel layout with a sidebar).
 *
 * The Navbar and Footer are passed as ReactNode props so they can stay
 * server components — this client wrapper just decides whether to render them.
 */
export default function SiteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/admin") ?? false;

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      {children}
      {footer}
    </>
  );
}
