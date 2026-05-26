"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmDialog";

export default function DeleteRowButton({
  url,
  label = "Delete",
  confirmText = "Delete this item? This action cannot be undone.",
}: {
  url: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    const ok = await confirm({
      title: "Delete",
      message: confirmText,
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch(url, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error ?? "Failed to delete");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-red-600 font-semibold hover:underline"
    >
      {busy ? "..." : label}
    </button>
  );
}
