import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function extractClientIp(): string | null {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  // 172.16.0.0 – 172.31.255.255
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

type GeoResult = {
  city?: string;
  postal?: string;
  region?: string;
  country_code?: string;
  error?: boolean;
};

async function lookupGeo(ip: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "GlobalServiceMitra/1.0" },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GeoResult;
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function GET() {
  const ip = extractClientIp();
  if (!ip || isPrivateIp(ip)) {
    return NextResponse.json({ locality: null, reason: "local" });
  }

  const geo = await lookupGeo(ip);
  if (!geo?.city) {
    return NextResponse.json({ locality: null, reason: "geo-unavailable" });
  }

  const city = geo.city.trim();
  const pincode = geo.postal?.trim() || null;

  // Match strategy: exact pincode > exact city > city contains
  let match = null;
  if (pincode) {
    match = await prisma.locality.findFirst({
      where: { active: true, pincode },
      select: { id: true, name: true, city: true, pincode: true },
    });
  }
  if (!match) {
    match = await prisma.locality.findFirst({
      where: { active: true, city: { equals: city, mode: "insensitive" } },
      select: { id: true, name: true, city: true, pincode: true },
    });
  }
  if (!match) {
    match = await prisma.locality.findFirst({
      where: { active: true, city: { contains: city, mode: "insensitive" } },
      select: { id: true, name: true, city: true, pincode: true },
    });
  }

  if (!match) {
    return NextResponse.json({
      locality: null,
      reason: "no-match",
      detectedCity: city,
    });
  }

  return NextResponse.json({ locality: match, detectedCity: city });
}
