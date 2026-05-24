import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  target: z.enum(["services", "products", "both"]),
  categoryId: z.string().nullable().optional(),
  discountPct: z.number().int().min(0).max(90),
  saleStartsAt: z.string().nullable().optional(),
  saleEndsAt: z.string().nullable().optional(),
  clear: z.boolean().optional(),
});

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { target, categoryId, discountPct, saleStartsAt, saleEndsAt, clear } = parsed.data;

  const where = categoryId ? { categoryId } : {};
  const data = clear
    ? { discountPct: 0, saleStartsAt: null, saleEndsAt: null }
    : {
        discountPct,
        saleStartsAt: saleStartsAt ? new Date(saleStartsAt) : null,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
      };

  let services = 0;
  let products = 0;

  if (target === "services" || target === "both") {
    const r = await prisma.service.updateMany({ where, data });
    services = r.count;
  }
  if (target === "products" || target === "both") {
    const r = await prisma.product.updateMany({ where, data });
    products = r.count;
  }

  return NextResponse.json({ ok: true, services, products });
}
