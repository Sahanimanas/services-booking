"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";

export default function RegisterCard({ next }: { next: string }) {
  const router = useRouter();
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
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not create account");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="card p-8">
      <div className="text-center mb-6">
        <div className="mx-auto w-fit">
          <LogoMark size={44} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Create Account</h1>
        <p className="text-sm text-slate-500">Join Global Service Mitra in a minute</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Full name</span>
          <input name="name" required className="input mt-1" placeholder="Your name" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Email Address</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Mobile Number</span>
          <div className="mt-1 flex">
            <span className="inline-flex items-center px-3 rounded-l-xl bg-brand-50 border border-r-0 border-brand-100 text-brand-700 font-semibold">
              +91
            </span>
            <input
              name="phone"
              required
              inputMode="tel"
              pattern="[0-9]{10}"
              className="input rounded-l-none"
              placeholder="10-digit mobile"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="input mt-1"
            placeholder="Minimum 6 characters"
          />
        </label>
        {err && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {err}
          </div>
        )}
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating..." : "Register →"}
        </button>
      </form>
    </div>
  );
}
