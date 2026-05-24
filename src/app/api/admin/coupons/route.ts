import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/),
  description: z.string().nullable().optional(),
  kind: z.enum(["PERCENT", "FLAT"]),
  value: z.number().int().min(1),
  minSubtotalCents: z.number().int().min(0),
  maxDiscountCents: z.number().int().min(0).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  active: z.boolean(),
});

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  if (d.kind === "PERCENT" && (d.value < 1 || d.value > 100)) {
    return NextResponse.json({ error: "Percent must be 1-100" }, { status: 400 });
  }
  try {
    const c = await prisma.coupon.create({
      data: {
        code: d.code,
        description: d.description ?? null,
        kind: d.kind,
        value: d.value,
        minSubtotalCents: d.minSubtotalCents,
        maxDiscountCents: d.maxDiscountCents ?? null,
        startsAt: d.startsAt ? new Date(d.startsAt) : null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
        usageLimit: d.usageLimit ?? null,
        active: d.active,
      },
    });
    return NextResponse.json({ ok: true, id: c.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A coupon with that code already exists" }, { status: 409 });
    }
    throw e;
  }
}
