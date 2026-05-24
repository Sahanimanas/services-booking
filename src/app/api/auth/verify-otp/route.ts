import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { normalizePhone, verifyOtp } from "@/lib/otp";

const Body = z.object({
  phone: z.string().trim(),
  code: z.string().trim().length(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit OTP" }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  const ok = await verifyOtp(phone, parsed.data.code);
  if (!ok) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, phoneVerified: true },
    });
  } else if (!user.phoneVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });
  }

  await createSession({ uid: user.id, role: user.role });
  return NextResponse.json({ ok: true });
}
