import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCoupon } from "@/lib/coupons";

const Body = z.object({
  code: z.string().trim().min(1),
  subtotalCents: z.number().int().nonnegative(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const code = parsed.data.code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const v = validateCoupon(coupon, parsed.data.subtotalCents);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  return NextResponse.json({
    ok: true,
    code: v.coupon.code,
    kind: v.coupon.kind,
    value: v.coupon.value,
    discountCents: v.discountCents,
    description: v.coupon.description,
  });
}
