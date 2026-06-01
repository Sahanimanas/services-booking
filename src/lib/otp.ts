import { prisma } from "./db";
import { otpEmailHtml, sendMail } from "./mailer";

const OTP_TTL_MIN = 10;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function issueOtp(phone: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000);
  await prisma.otpCode.create({ data: { phone, code, expiresAt } });

  // If the phone is registered to a user with an email, deliver the code via email.
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { email: true, name: true },
  });

  if (user?.email) {
    sendMail({
      to: user.email,
      subject: "Your Global Service Mitra login code",
      html: otpEmailHtml(code, user.name),
      text: `Your login code is ${code}. It expires in ${OTP_TTL_MIN} minutes.`,
    }).catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[OTP] email send failed:", e);
    });
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
