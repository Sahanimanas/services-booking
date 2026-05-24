import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  const target = url.searchParams.get("target") ?? "services";
  const categoryId = url.searchParams.get("categoryId") || null;
  const where = categoryId ? { categoryId } : {};
  const [services, products] = await Promise.all([
    target === "products" ? 0 : prisma.service.count({ where }),
    target === "services" ? 0 : prisma.product.count({ where }),
  ]);
  return NextResponse.json({ services, products });
}
