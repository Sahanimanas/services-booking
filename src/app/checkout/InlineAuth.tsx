"use client";

import { useState } from "react";

type AuthedUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
};

type Mode = "login-email" | "login-mobile" | "register";

export default function InlineAuth({ onAuthed }: { onAuthed: (u: AuthedUser) => void }) {
  const [mode, setMode] = useState<Mode>("login-email");
  return (
    <div className="card p-6">
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold">Sign in to place your order</h2>
        <p className="text-sm text-ink-900/60">
          Your cart is saved — log in with email or phone, or create an account.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-slate-100 mb-5 text-sm font-semibold">
        <TabBtn active={mode === "login-email"} onClick={() => setMode("login-email")}>
          ✉ Email
        </TabBtn>
        <TabBtn active={mode === "login-mobile"} onClick={() => setMode("login-mobile")}>
          📞 Mobile
        </TabBtn>
        <TabBtn active={mode === "register"} onClick={() => setMode("register")}>
          ✨ Register
        </TabBtn>
      </div>

      {mode === "login-email" && <EmailForm onAuthed={onAuthed} />}
      {mode === "login-mobile" && <MobileForm onAuthed={onAuthed} />}
      {mode === "register" && <RegisterForm onAuthed={onAuthed} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "py-2 rounded-full transition " +
        (active ? "bg-white text-slate-900 shadow" : "text-ink-900/60")
      }
    >
      {children}
    </button>
  );
}

async function fetchMe(): Promise<AuthedUser | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) return null;
  return (await res.json()) as AuthedUser;
}

function EmailForm({ onAuthed }: { onAuthed: (u: AuthedUser) => void }) {
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
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    if (!res.ok) {
      setBusy(false);
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Invalid email or password");
      return;
    }
    const me = await fetchMe();
    setBusy(false);
    if (me) onAuthed(me);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="email" type="email" required placeholder="Email" className="input" />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="input"
      />
      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Signing in..." : "Sign in →"}
      </button>
    </form>
  );
}

function MobileForm({ onAuthed }: { onAuthed: (u: AuthedUser) => void }) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

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
    const data = await res.json();
    if (data?.devCode) setHint(`Dev OTP: ${data.devCode}`);
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
    if (!res.ok) {
      setBusy(false);
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Invalid OTP");
      return;
    }
    const me = await fetchMe();
    setBusy(false);
    if (me) onAuthed(me);
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendOtp} className="space-y-3">
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-slate-700 font-semibold">
            +91
          </span>
          <input
            required
            inputMode="tel"
            pattern="[0-9]{10}"
            value={phone}
            placeholder="10-digit mobile"
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="input rounded-l-none"
          />
        </div>
        {err && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={busy || phone.length !== 10}
          className="btn-primary w-full"
        >
          {busy ? "Sending..." : "Send OTP →"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="space-y-3">
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
      <input
        name="code"
        required
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="••••••"
        className="input tracking-[0.5em] text-center text-lg"
      />
      {hint && <div className="text-xs text-slate-700 bg-slate-100 rounded-xl p-2">{hint}</div>}
      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Verifying..." : "Verify & Sign In →"}
      </button>
    </form>
  );
}

function RegisterForm({ onAuthed }: { onAuthed: (u: AuthedUser) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
      }),
    });
    if (!res.ok) {
      setBusy(false);
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not create account");
      return;
    }
    const me = await fetchMe();
    setBusy(false);
    if (me) onAuthed(me);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="name" required placeholder="Full name" className="input" />
      <input name="email" type="email" required placeholder="Email" className="input" />
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-slate-700 font-semibold">
          +91
        </span>
        <input
          name="phone"
          required
          inputMode="tel"
          pattern="[0-9]{10}"
          placeholder="10-digit mobile"
          className="input rounded-l-none"
        />
      </div>
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Password (min 6 chars)"
        className="input"
      />
      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Creating..." : "Create account & continue →"}
      </button>
    </form>
  );
}
