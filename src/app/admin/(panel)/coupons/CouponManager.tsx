"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rupees } from "@/lib/format";

type Coupon = {
  id: string;
  code: string;
  description: string;
  kind: "PERCENT" | "FLAT";
  value: number;
  minSubtotalCents: number;
  maxDiscountCents: number | null;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

const empty: Omit<Coupon, "id" | "usedCount"> = {
  code: "",
  description: "",
  kind: "PERCENT",
  value: 10,
  minSubtotalCents: 0,
  maxDiscountCents: null,
  startsAt: "",
  expiresAt: "",
  usageLimit: null,
  active: true,
};

export default function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...empty });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        code: form.code.trim().toUpperCase(),
        description: form.description || null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        usageLimit: form.usageLimit ?? null,
        maxDiscountCents: form.maxDiscountCents ?? null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not save");
      return;
    }
    setForm({ ...empty });
    router.refresh();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Could not delete");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="card p-5 lg:col-span-1">
        <h2 className="font-semibold mb-3">New Coupon</h2>
        <div className="space-y-3">
          <input
            placeholder="CODE e.g. WELCOME20"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })
            }
            className="input"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.kind}
              onChange={(e) =>
                setForm({ ...form, kind: e.target.value as "PERCENT" | "FLAT" })
              }
              className="input"
            >
              <option value="PERCENT">Percent off</option>
              <option value="FLAT">Flat ₹ off</option>
            </select>
            <input
              type="number"
              min={1}
              max={form.kind === "PERCENT" ? 100 : undefined}
              placeholder={form.kind === "PERCENT" ? "% off" : "₹ off"}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Min cart total (₹)</label>
            <input
              type="number"
              min={0}
              value={form.minSubtotalCents / 100}
              onChange={(e) =>
                setForm({ ...form, minSubtotalCents: Math.round(Number(e.target.value) * 100) })
              }
              className="input mt-1"
            />
          </div>
          {form.kind === "PERCENT" && (
            <div>
              <label className="text-xs font-semibold">Max discount cap (₹, optional)</label>
              <input
                type="number"
                min={0}
                value={form.maxDiscountCents != null ? form.maxDiscountCents / 100 : ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxDiscountCents: e.target.value
                      ? Math.round(Number(e.target.value) * 100)
                      : null,
                  })
                }
                className="input mt-1"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold">Starts</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Expires</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="input mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Usage limit (blank = unlimited)</label>
            <input
              type="number"
              min={1}
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })
              }
              className="input mt-1"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
          <button
            type="button"
            disabled={busy || !form.code || !form.value}
            onClick={add}
            className="btn-primary w-full"
          >
            {busy ? "Saving..." : "Create coupon"}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Discount</th>
              <th className="px-5 py-3">Min cart</th>
              <th className="px-5 py-3">Validity</th>
              <th className="px-5 py-3">Usage</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-t border-slate-200/60">
                <td className="px-5 py-3 font-bold tracking-wider">{c.code}</td>
                <td className="px-5 py-3">
                  {c.kind === "PERCENT" ? `${c.value}%` : rupees(c.value)}
                  {c.kind === "PERCENT" && c.maxDiscountCents != null && (
                    <span className="block text-xs text-ink-900/50">
                      max {rupees(c.maxDiscountCents)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {c.minSubtotalCents > 0 ? rupees(c.minSubtotalCents) : "—"}
                </td>
                <td className="px-5 py-3 text-xs text-ink-900/70">
                  {c.startsAt && <div>from {new Date(c.startsAt).toLocaleDateString()}</div>}
                  {c.expiresAt && <div>to {new Date(c.expiresAt).toLocaleDateString()}</div>}
                  {!c.startsAt && !c.expiresAt && "always"}
                </td>
                <td className="px-5 py-3">
                  {c.usedCount}
                  {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(c.id, c.active)}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.active ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="text-red-600 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-ink-900/50">
                  No coupons yet — add one on the left.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
