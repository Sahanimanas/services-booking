"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

type Tab = "email" | "mobile";

export default function LoginCard({ next }: { next: string }) {
  const [tab, setTab] = useState<Tab>("email");
  return (
    <div className="card p-8">
      <div className="text-center mb-6">
        <div className="mx-auto w-fit">
          <LogoMark size={44} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome Back</h1>
        <p className="text-sm text-slate-500">Login to access your account</p>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-slate-100 mb-6">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={
            "py-2 rounded-full font-semibold text-sm transition " +
            (tab === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")
          }
        >
          ✉ Email
        </button>
        <button
          type="button"
          onClick={() => setTab("mobile")}
          className={
            "py-2 rounded-full font-semibold text-sm transition " +
            (tab === "mobile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")
          }
        >
          📞 Mobile
        </button>
      </div>

      {tab === "email" ? <EmailForm next={next} /> : <MobileForm next={next} />}
    </div>
  );
}

function EmailForm({ next }: { next: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Invalid email or password");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Email Address</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          className="input mt-1"
        />
      </label>
      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Password</span>
          <Link href="/forgot" className="text-xs text-red-600 font-semibold">
            Forgot Password?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          className="input mt-1"
        />
      </label>
      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Signing in..." : "Login →"}
      </button>
    </form>
  );
}

function MobileForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not send OTP");
      return;
    }
    setStep("otp");
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: fd.get("code") }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Invalid OTP");
      return;
    }
    router.push(next);
    router.refresh();
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendOtp} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Mobile Number</span>
          <div className="mt-1 flex">
            <span className="inline-flex items-center px-3 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-slate-700 font-semibold">
              +91
            </span>
            <input
              required
              inputMode="tel"
              pattern="[0-9]{10}"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="input rounded-l-none"
            />
          </div>
        </label>
        {err && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {err}
          </div>
        )}
        <button type="submit" className="btn-primary w-full" disabled={busy || phone.length !== 10}>
          {busy ? "Sending..." : "Send OTP →"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <p className="text-sm text-ink-900/60">
        OTP sent to <b>+91 {phone}</b>.{" "}
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="text-slate-700 underline"
        >
          Change
        </button>
      </p>
      <label className="block">
        <span className="text-sm font-semibold">Enter 6-digit OTP</span>
        <input
          name="code"
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="••••••"
          className="input mt-1 tracking-[0.5em] text-center text-lg"
        />
      </label>
      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Verifying..." : "Verify & Sign In →"}
      </button>
    </form>
  );
}
