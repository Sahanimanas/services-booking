import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  description: z.string().nullable().optional(),
  value: z.number().int().min(1).optional(),
  minSubtotalCents: z.number().int().min(0).optional(),
  maxDiscountCents: z.number().int().min(0).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const d = parsed.data;
  await prisma.coupon.update({
    where: { id: params.id },
    data: {
      ...d,
      startsAt: d.startsAt ? new Date(d.startsAt) : d.startsAt === null ? null : undefined,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : d.expiresAt === null ? null : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
