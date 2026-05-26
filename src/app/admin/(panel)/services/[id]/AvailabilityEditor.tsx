"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmDialog";

type Item = { id?: string; date: string; slots: string; capacity: number };

export default function AvailabilityEditor({
  serviceId,
  initial,
}: {
  serviceId: string;
  initial: Item[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [items, setItems] = useState<Item[]>(initial);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState("09:00,11:00,14:00,17:00");
  const [capacity, setCapacity] = useState(5);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!date) return;
    setBusy(true);
    const res = await fetch(`/api/admin/services/${serviceId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, slots, capacity: Number(capacity) }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Could not add date");
      return;
    }
    const data = await res.json();
    setItems((prev) => {
      const filtered = prev.filter((p) => p.date !== date);
      return [...filtered, { id: data.id, date, slots, capacity: Number(capacity) }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });
    setDate("");
    router.refresh();
  }

  async function remove(id?: string) {
    if (!id) return;
    const ok = await confirm({
      title: "Remove date",
      message: "Remove this availability date and its slots?",
      confirmText: "Remove",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch(`/api/admin/services/${serviceId}/availability/${id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      alert("Could not remove");
      return;
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold">Capacity</span>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="input mt-1"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold">Time slots (CSV, 24h)</span>
          <input
            value={slots}
            onChange={(e) => setSlots(e.target.value)}
            placeholder="09:00,11:00,14:00"
            className="input mt-1"
          />
        </label>
        <div className="sm:col-span-2">
          <button type="button" onClick={add} disabled={busy || !date} className="btn-primary w-full">
            {busy ? "Saving..." : "+ Add date"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-ink-900/50">No dates configured yet.</p>
        )}
        {items.map((it) => (
          <div
            key={it.id ?? it.date}
            className="rounded-xl border border-slate-200 p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">
                {new Date(it.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-ink-900/60">
                Slots: {it.slots} · Capacity: {it.capacity}
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="text-red-600 text-sm font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
