import nodemailer, { type Transporter } from "nodemailer";

/**
 * SMTP transport for Zoho Mail.
 *
 * Env vars (set in .env or hosting provider):
 *   SMTP_HOST       smtp.zoho.com  (or smtp.zoho.in for India)
 *   SMTP_PORT       465 (SSL) or 587 (STARTTLS) — default 465
 *   SMTP_USER       info@globalservicemitra.com
 *   SMTP_PASS       Zoho app-specific password (NOT your login password)
 *   MAIL_FROM       "Global Service Mitra <info@globalservicemitra.com>"
 *   ADMIN_EMAIL     where booking notifications go (defaults to SMTP_USER)
 */

const HOST = process.env.SMTP_HOST || "smtp.zoho.com";
const PORT = Number(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_PASS || "";
const FROM =
  process.env.MAIL_FROM ||
  (USER ? `Global Service Mitra <${USER}>` : "");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || USER;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!USER || !PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465, // 465 = implicit SSL; 587 = STARTTLS
    auth: { user: USER, pass: PASS },
  });
  return transporter;
}

export function getAdminEmail(): string {
  return ADMIN_EMAIL || "info@globalservicemitra.com";
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const t = getTransporter();
  if (!t) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[mailer] SMTP not configured — would send:", {
        to: opts.to,
        subject: opts.subject,
      });
    }
    return { ok: false, reason: "not-configured" };
  }
  try {
    await t.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return { ok: true };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[mailer] send failed:", e);
    return { ok: false, reason: "send-failed" };
  }
}

// ─── Templates ─────────────────────────────────────────────────────────

function shellHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <tr><td style="padding:20px 24px;background:linear-gradient(135deg,#1d4ed8,#f97316);color:#fff">
      <div style="font-weight:800;font-size:18px;letter-spacing:.2px">Global Service Mitra</div>
      <div style="font-size:11px;opacity:.85;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px">Service · Support · Solutions</div>
    </td></tr>
    <tr><td style="padding:24px">${body}</td></tr>
    <tr><td style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:11px;color:#64748b">
      You're receiving this email from Global Service Mitra. A unit of Global Service Mitra Private Limited.
    </td></tr>
  </table>
</body></html>`;
}

export function otpEmailHtml(code: string, name?: string | null): string {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  return shellHtml(
    "Your login code",
    `<p style="margin:0 0 10px;font-size:15px">${greeting}</p>
     <p style="margin:0 0 18px;font-size:15px;color:#334155">Use the code below to sign in. It expires in 10 minutes.</p>
     <div style="text-align:center;margin:20px 0">
       <div style="display:inline-block;font-size:32px;font-weight:800;letter-spacing:8px;padding:14px 22px;border-radius:12px;background:#0f172a;color:#fff">${escapeHtml(code)}</div>
     </div>
     <p style="margin:18px 0 0;font-size:12px;color:#64748b">If you didn't request this code, you can safely ignore this email.</p>`
  );
}

type BookingForMail = {
  id: string;
  contactName: string;
  contactPhone: string;
  address: string;
  scheduledAt: Date;
  notes: string | null;
  totalCents: number;
  service: { title: string };
  locality: { name: string; city: string };
  user: { email: string | null; name: string | null; phone: string | null };
};

export function bookingAdminHtml(b: BookingForMail): string {
  const when = b.scheduledAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const total = `₹${(b.totalCents / 100).toFixed(2)}`;
  return shellHtml(
    "New booking",
    `<h2 style="margin:0 0 6px;font-size:18px">New booking received</h2>
     <p style="margin:0 0 18px;color:#475569;font-size:13px">Booking ID <code>${escapeHtml(b.id)}</code></p>
     ${row("Service", b.service.title)}
     ${row("Scheduled for", when)}
     ${row("Locality", `${escapeHtml(b.locality.name)}, ${escapeHtml(b.locality.city)}`)}
     ${row("Total", total)}
     <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
     <h3 style="margin:0 0 6px;font-size:14px;color:#0f172a">Customer</h3>
     ${row("Name", b.contactName)}
     ${row("Phone", b.contactPhone)}
     ${b.user.email ? row("Account email", b.user.email) : ""}
     ${row("Address", b.address)}
     ${b.notes ? row("Notes", b.notes) : ""}`
  );
}

function row(label: string, value: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 8px">
    <tr>
      <td style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;width:130px;vertical-align:top;padding-top:2px">${escapeHtml(label)}</td>
      <td style="font-size:14px;color:#0f172a">${escapeHtml(value)}</td>
    </tr>
  </table>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
