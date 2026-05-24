"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cat = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  services: number;
  products: number;
};

export default function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, icon }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not add");
      return;
    }
    setName("");
    setSlug("");
    setIcon("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Services/products under it will not be deletable if linked.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
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
        <h2 className="font-semibold mb-3">Add Category</h2>
        <div className="space-y-3">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            placeholder="slug-kebab-case"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            className="input"
          />
          <input
            placeholder="Icon key (snow, droplet, etc)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="input"
          />
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
          <button type="button" disabled={busy || !name || !slug} onClick={add} className="btn-primary w-full">
            {busy ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Services</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-t border-slate-200/60">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-ink-900/70">{c.slug}</td>
                <td className="px-5 py-3">{c.services}</td>
                <td className="px-5 py-3">{c.products}</td>
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
                <td colSpan={5} className="text-center py-10 text-ink-900/50">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
