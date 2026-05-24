"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type L = {
  id: string;
  name: string;
  city: string;
  pincode: string;
  active: boolean;
  bookings: number;
};

export default function LocalityManager({ initial }: { initial: L[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/localities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city, pincode }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not add");
      return;
    }
    setName("");
    setCity("");
    setPincode("");
    router.refresh();
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/localities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this locality?")) return;
    const res = await fetch(`/api/admin/localities/${id}`, { method: "DELETE" });
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
        <h2 className="font-semibold mb-3">Add Locality</h2>
        <div className="space-y-3">
          <input
            placeholder="Area name e.g. Salt Lake"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
          />
          <input
            placeholder="Pincode (optional)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="input"
          />
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {err}
            </div>
          )}
          <button type="button" disabled={busy || !name || !city} onClick={add} className="btn-primary w-full">
            {busy ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto lg:col-span-2">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">City</th>
              <th className="px-5 py-3">Pincode</th>
              <th className="px-5 py-3">Bookings</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((l) => (
              <tr key={l.id} className="border-t border-brand-100/60">
                <td className="px-5 py-3 font-medium">{l.name}</td>
                <td className="px-5 py-3">{l.city}</td>
                <td className="px-5 py-3 text-ink-900/70">{l.pincode}</td>
                <td className="px-5 py-3">{l.bookings}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(l.id, l.active)}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      l.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {l.active ? "Yes" : "No"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => remove(l.id)} className="text-accent-600 font-semibold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {initial.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-ink-900/50">
                  No localities yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
