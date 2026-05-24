"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function BookingStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const router = useRouter();
  const [val, setVal] = useState(current);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setBusy(true);
    setVal(next);
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      setVal(current);
      alert("Failed to update");
    }
  }

  return (
    <select
      value={val}
      onChange={(e) => change(e.target.value)}
      disabled={busy}
      className="input py-1.5 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
