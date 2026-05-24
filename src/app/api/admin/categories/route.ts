import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  icon: z.string().trim().optional().nullable(),
});

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const cat = await prisma.category.create({
      data: { name: parsed.data.name, slug: parsed.data.slug, icon: parsed.data.icon ?? null },
    });
    return NextResponse.json({ ok: true, id: cat.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Name or slug already exists" }, { status: 409 });
    }
    throw e;
  }
}
