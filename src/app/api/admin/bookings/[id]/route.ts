import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await prisma.booking.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
