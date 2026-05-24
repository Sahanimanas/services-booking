import { prisma } from "./db";

const OTP_TTL_MIN = 10;

export function generateOtp(): string {
  const fixed = process.env.DEV_OTP_CODE;
  if (fixed && fixed !== "random") return fixed;
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(phone: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000);
  await prisma.otpCode.create({ data: { phone, code, expiresAt } });

  // In production, integrate an SMS gateway here (Twilio / MSG91 / etc).
  // For now we log to the server console so devs can read the OTP.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[OTP] phone=${phone} code=${code}`);
  }

  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({
    where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;
  await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
  // Clean older codes for this phone
  await prisma.otpCode.deleteMany({
    where: { phone, used: false, expiresAt: { lt: new Date() } },
  });
  return true;
}

export function normalizePhone(input: string): string {
  return input.replace(/[^\d]/g, "").slice(-10);
}
