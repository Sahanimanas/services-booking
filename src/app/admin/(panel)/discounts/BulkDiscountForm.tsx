"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export default function BulkDiscountForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<"services" | "products" | "both">("services");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [discountPct, setDiscountPct] = useState<number>(20);
  const [startsAt, setStartsAt] = useState<string>("");
  const [endsAt, setEndsAt] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function preview() {
    setBusy(true);
    setErr(null);
    setResult(null);
    const params = new URLSearchParams({
      target,
      categoryId: categoryId === "all" ? "" : categoryId,
    });
    const res = await fetch(`/api/admin/bulk-discount/preview?${params.toString()}`);
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not preview");
      return;
    }
    const data = await res.json();
    setResult(
      `Will affect ${data.services} services + ${data.products} products.`
    );
  }

  async function apply() {
    if (!confirm("Apply this discount + sale window to all matching items?")) return;
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/bulk-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target,
        categoryId: categoryId === "all" ? null : categoryId,
        discountPct,
        saleStartsAt: startsAt ? new Date(startsAt).toISOString() : null,
        saleEndsAt: endsAt ? new Date(endsAt).toISOString() : null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not apply");
      return;
    }
    const data = await res.json();
    setResult(`✓ Updated ${data.services} services + ${data.products} products.`);
    router.refresh();
  }

  async function clearDiscount() {
    if (!confirm("Remove discount + sale window from matching items? (Sets discountPct to 0 and clears sale dates.)"))
      return;
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/bulk-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target,
        categoryId: categoryId === "all" ? null : categoryId,
        discountPct: 0,
        saleStartsAt: null,
        saleEndsAt: null,
        clear: true,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not clear");
      return;
    }
    const data = await res.json();
    setResult(`✓ Cleared discount on ${data.services} services + ${data.products} products.`);
    router.refresh();
  }

  return (
    <div className="card p-6 max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-semibold">Apply to</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as any)}
            className="input mt-1"
          >
            <option value="services">Services only</option>
            <option value="products">Products only</option>
            <option value="both">Services + Products</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Category filter</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input mt-1"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold">Discount percentage</span>
        <input
          type="number"
          min={0}
          max={90}
          value={discountPct}
          onChange={(e) => setDiscountPct(Number(e.target.value))}
          className="input mt-1"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-semibold">Sale starts (optional)</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Sale ends (optional)</span>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="input mt-1"
          />
        </label>
      </div>
      <p className="text-xs text-ink-900/55">
        Leave start/end blank to make the discount permanent. Setting them turns it into a
        time-limited sale.
      </p>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
      {result && (
        <div className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          {result}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2 border-t">
        <button type="button" onClick={preview} disabled={busy} className="btn-outline">
          Preview match
        </button>
        <button type="button" onClick={apply} disabled={busy} className="btn-primary">
          {busy ? "Applying..." : "Apply discount"}
        </button>
        <button
          type="button"
          onClick={clearDiscount}
          disabled={busy}
          className="btn-ghost text-red-600"
        >
          Clear discount on matches
        </button>
      </div>
    </div>
  );
}
