import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({ role: z.enum(["USER", "ADMIN"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  // Safety: prevent demoting yourself
  if (admin.id === params.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: params.id }, data: { role: parsed.data.role } });
  return NextResponse.json({ ok: true });
}
