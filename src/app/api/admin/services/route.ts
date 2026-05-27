import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

const Body = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(1),
  priceRupees: z.number().int().nonnegative(),
  discountPct: z.number().int().min(0).max(90),
  saleStartsAt: z.string().nullable().optional(),
  saleEndsAt: z.string().nullable().optional(),
  durationMin: z.number().int().min(5),
  imageUrl: z.string().url().nullable().optional(),
  active: z.boolean(),
  categoryId: z.string().min(1),
});

export async function GET() {
  await requireAdmin();
  const services = await prisma.service.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { priceRupees, saleStartsAt, saleEndsAt, ...rest } = parsed.data;
  try {
    const service = await prisma.service.create({
      data: {
        ...rest,
        priceCents: priceRupees * 100,
        saleStartsAt: saleStartsAt ? new Date(saleStartsAt) : null,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
      },
    });
    revalidateStorefront();
    return NextResponse.json({ ok: true, id: service.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
