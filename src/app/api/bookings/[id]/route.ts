import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (booking.status === "COMPLETED" || booking.status === "IN_PROGRESS") {
    return NextResponse.json({ error: "Cannot cancel" }, { status: 400 });
  }
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });
  return NextResponse.json({ ok: true });
}
