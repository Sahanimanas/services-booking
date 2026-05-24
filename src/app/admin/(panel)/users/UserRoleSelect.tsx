"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRoleSelect({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [val, setVal] = useState(current);
  const [busy, setBusy] = useState(false);

  async function change(next: string) {
    setBusy(true);
    setVal(next);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      setVal(current);
      alert("Failed");
    }
  }

  return (
    <select value={val} disabled={busy} onChange={(e) => change(e.target.value)} className="input py-1.5 text-xs">
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  );
}
