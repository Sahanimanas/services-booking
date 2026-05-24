import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  name: z.string().trim().min(1),
  city: z.string().trim().min(1),
  pincode: z.string().trim().optional().nullable(),
});

export async function POST(req: Request) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const loc = await prisma.locality.create({
      data: { ...parsed.data, pincode: parsed.data.pincode || null },
    });
    return NextResponse.json({ ok: true, id: loc.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Name already exists" }, { status: 409 });
    }
    throw e;
  }
}
