import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; availId: string } }
) {
  await requireAdmin();
  await prisma.serviceAvailability.delete({ where: { id: params.availId } });
  revalidateStorefront();
  return NextResponse.json({ ok: true });
}
