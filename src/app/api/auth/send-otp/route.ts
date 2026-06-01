import { NextResponse } from "next/server";
import { z } from "zod";
import { issueOtp, normalizePhone } from "@/lib/otp";

const Body = z.object({ phone: z.string().trim().min(10) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  if (phone.length !== 10) {
    return NextResponse.json({ error: "Enter a 10-digit phone" }, { status: 400 });
  }
  await issueOtp(phone);
  return NextResponse.json({ ok: true });
}
