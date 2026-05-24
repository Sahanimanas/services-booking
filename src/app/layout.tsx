import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://globalservicemitra.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Global Service Mitra — Trusted Home Services On Demand",
    template: "%s · Global Service Mitra",
  },
  description:
    "Service · Support · Solutions. Book trusted home services in your locality — AC, RO, washing machine, refrigerator, plumbing and electrician — by verified professionals.",
  keywords: [
    "global service mitra",
    "GSM",
    "home services india",
    "AC repair",
    "RO service",
    "washing machine repair",
    "refrigerator repair",
    "plumber",
    "electrician",
    "service booking",
  ],
  openGraph: {
    type: "website",
    title: "Global Service Mitra — Trusted Home Services",
    description:
      "Trusted Support. Smart Solutions. Stronger Together. Book verified professionals for every home service.",
    url: siteUrl,
    siteName: "Global Service Mitra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Service Mitra — Trusted Home Services",
    description: "Verified pros for every home service. Book in minutes.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
