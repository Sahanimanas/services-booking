import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://globalservicemitra.in";
  const staticRoutes = ["", "/services", "/about", "/contact", "/login", "/register"];
  const services = await prisma.service
    .findMany({ where: { active: true }, select: { slug: true, updatedAt: true } })
    .catch(() => []);

  return [
    ...staticRoutes.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
