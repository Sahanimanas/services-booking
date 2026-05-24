import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/otp";

const Body = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim(),
  password: z.string().min(6).max(120),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const phone = normalizePhone(parsed.data.phone);
  if (phone.length !== 10) {
    return NextResponse.json({ error: "Enter a valid 10-digit phone" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email or phone already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  });
  await createSession({ uid: user.id, role: user.role });
  return NextResponse.json({ ok: true });
}
