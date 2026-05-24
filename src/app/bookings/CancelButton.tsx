"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!confirm("Cancel this booking?")) return;
    setBusy(true);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Could not cancel. Please contact support.");
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={busy}
      className="mt-2 text-xs text-accent-600 font-semibold hover:underline"
    >
      {busy ? "Cancelling..." : "Cancel booking"}
    </button>
  );
}
