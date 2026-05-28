import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectiveUnitCents } from "@/lib/pricing";
import { bookingAdminHtml, getAdminEmail, sendMail } from "@/lib/mailer";

const Body = z.object({
  serviceId: z.string().min(1),
  localityId: z.string().min(1),
  address: z.string().trim().min(5),
  contactName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(10),
  scheduledAt: z.string().min(1),
  notes: z.string().trim().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to book" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
  }
  const data = parsed.data;
  const scheduledAt = new Date(data.scheduledAt);
  if (Number.isNaN(scheduledAt.valueOf()) || scheduledAt < new Date()) {
    return NextResponse.json({ error: "Choose a future time" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 404 });
  }
  const locality = await prisma.locality.findUnique({ where: { id: data.localityId } });
  if (!locality || !locality.active) {
    return NextResponse.json({ error: "We don't serve this locality yet" }, { status: 400 });
  }

  const unit = effectiveUnitCents(service);
  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      serviceId: service.id,
      localityId: locality.id,
      address: data.address,
      contactName: data.contactName,
      contactPhone: data.contactPhone.replace(/\D/g, "").slice(-10),
      scheduledAt,
      notes: data.notes ?? null,
      subtotalCents: unit,
      discountCents: 0,
      totalCents: unit,
    },
  });

  // Fire-and-forget admin notification — never block the booking response.
  notifyAdminOfBooking(booking.id).catch((e) => {
    // eslint-disable-next-line no-console
    console.error("[bookings] admin email failed:", e);
  });

  return NextResponse.json({ ok: true, id: booking.id });
}

async function notifyAdminOfBooking(bookingId: string) {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { title: true } },
      locality: { select: { name: true, city: true } },
      user: { select: { email: true, name: true, phone: true } },
    },
  });
  if (!b) return;
  await sendMail({
    to: getAdminEmail(),
    subject: `New booking: ${b.service.title} — ${b.contactName}`,
    html: bookingAdminHtml(b),
  });
}
