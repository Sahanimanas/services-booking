import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const Body = z.object({
  date: z.string().min(1),
  slots: z.string().min(1),
  capacity: z.number().int().min(1),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const date = new Date(parsed.data.date + "T00:00:00.000Z");
  if (Number.isNaN(date.valueOf())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const row = await prisma.serviceAvailability.upsert({
    where: { serviceId_date: { serviceId: params.id, date } },
    create: {
      serviceId: params.id,
      date,
      slots: parsed.data.slots,
      capacity: parsed.data.capacity,
    },
    update: { slots: parsed.data.slots, capacity: parsed.data.capacity },
  });

  return NextResponse.json({ ok: true, id: row.id });
}
