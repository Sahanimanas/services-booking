import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://globalservicemitra.com";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/bookings", "/account"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
