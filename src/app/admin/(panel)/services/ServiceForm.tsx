"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

type Category = { id: string; name: string };
type Service = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  discountPct: number;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
  durationMin: number;
  imageUrl: string | null;
  active: boolean;
  categoryId: string;
};

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function ServiceForm({
  categories,
  service,
}: {
  categories: Category[];
  service?: Service;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const editing = !!service;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const startsStr = (fd.get("saleStartsAt") as string) || "";
    const endsStr = (fd.get("saleEndsAt") as string) || "";
    const payload = {
      title: fd.get("title"),
      slug: fd.get("slug"),
      description: fd.get("description"),
      priceRupees: Number(fd.get("priceRupees")),
      discountPct: Number(fd.get("discountPct")),
      saleStartsAt: startsStr ? new Date(startsStr).toISOString() : null,
      saleEndsAt: endsStr ? new Date(endsStr).toISOString() : null,
      durationMin: Number(fd.get("durationMin")),
      imageUrl: (fd.get("imageUrl") as string) || null,
      active: fd.get("active") === "on",
      categoryId: fd.get("categoryId"),
    };
    const res = await fetch(
      editing ? `/api/admin/services/${service!.id}` : "/api/admin/services",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Failed to save");
      return;
    }
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-semibold">Title</span>
          <input name="title" defaultValue={service?.title} required className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Slug</span>
          <input
            name="slug"
            defaultValue={service?.slug}
            required
            pattern="[a-z0-9-]+"
            placeholder="e.g. window-ac-repair"
            className="input mt-1"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold">Description</span>
        <textarea
          name="description"
          rows={3}
          required
          defaultValue={service?.description}
          className="input mt-1"
        />
      </label>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="block">
          <span className="text-sm font-semibold">Price (₹)</span>
          <input
            name="priceRupees"
            type="number"
            min={0}
            required
            defaultValue={service ? service.priceCents / 100 : ""}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Discount %</span>
          <input
            name="discountPct"
            type="number"
            min={0}
            max={90}
            defaultValue={service?.discountPct ?? 0}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Duration (min)</span>
          <input
            name="durationMin"
            type="number"
            min={15}
            defaultValue={service?.durationMin ?? 60}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Category</span>
          <select name="categoryId" required defaultValue={service?.categoryId} className="input mt-1">
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 text-sm font-semibold">
          Sale window (optional)
          <p className="font-normal text-xs text-ink-900/55 mt-0.5">
            If set, the discount above only applies between these dates. Leave both blank for a
            permanent discount.
          </p>
        </div>
        <label className="block">
          <span className="text-xs font-semibold">Starts</span>
          <input
            name="saleStartsAt"
            type="datetime-local"
            defaultValue={toLocalInput(service?.saleStartsAt ?? null)}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold">Ends</span>
          <input
            name="saleEndsAt"
            type="datetime-local"
            defaultValue={toLocalInput(service?.saleEndsAt ?? null)}
            className="input mt-1"
          />
        </label>
      </div>

      <ImageUpload name="imageUrl" defaultValue={service?.imageUrl} label="Image" />

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" name="active" defaultChecked={service?.active ?? true} />
        <span className="text-sm">Active (visible to users)</span>
      </label>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving..." : editing ? "Save changes" : "Create service"}
        </button>
        <a href="/admin/services" className="btn-outline">
          Cancel
        </a>
      </div>
    </form>
  );
}
