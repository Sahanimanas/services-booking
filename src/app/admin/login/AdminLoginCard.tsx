"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginCard({ next }: { next: string }) {
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
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    if (!res.ok) {
      setBusy(false);
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Invalid credentials");
      return;
    }
    const data = await res.json();
    if (data?.role !== "ADMIN") {
      setBusy(false);
      setErr("This account is not an admin");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto rounded-xl bg-brand-gradient flex items-center justify-center text-white">
          🛡
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">Admin Sign In</h1>
        <p className="text-sm text-ink-900/60">Restricted area</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1"
            placeholder="admin@globalservicemitra.local"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input mt-1"
            placeholder="••••••••"
          />
        </label>
        {err && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {err}
          </div>
        )}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in..." : "Sign in →"}
        </button>
      </form>
    </div>
  );
}
