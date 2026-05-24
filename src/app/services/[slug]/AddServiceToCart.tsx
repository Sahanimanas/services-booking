"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { rupees } from "@/lib/format";

type Props = {
  service: {
    id: string;
    slug: string;
    title: string;
    imageUrl: string | null;
    unitCents: number;
  };
  localities: { id: string; name: string; city: string }[];
};

export default function AddServiceToCart({ service, localities }: Props) {
  const router = useRouter();
  const { addService } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultDT = tomorrow.toISOString().slice(0, 16);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const localityId = String(fd.get("localityId") ?? "");
    const locality = localities.find((l) => l.id === localityId);
    if (!locality) {
      setErr("Please select a locality");
      setAdding(false);
      return;
    }
    addService({
      serviceId: service.id,
      slug: service.slug,
      title: service.title,
      imageUrl: service.imageUrl,
      unitCents: service.unitCents,
      localityId,
      localityName: `${locality.name} (${locality.city})`,
      address: String(fd.get("address") ?? ""),
      contactName: String(fd.get("contactName") ?? ""),
      contactPhone: String(fd.get("contactPhone") ?? ""),
      scheduledAt: new Date(String(fd.get("scheduledAt"))).toISOString(),
      notes: String(fd.get("notes") ?? "") || undefined,
    });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Locality</span>
        <select name="localityId" required className="input mt-1">
          <option value="">Select your area</option>
          {localities.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.city})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Address</span>
        <textarea
          name="address"
          required
          rows={2}
          placeholder="House / flat no., street, landmark"
          className="input mt-1"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Contact name</span>
          <input name="contactName" required className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Contact phone</span>
          <input
            name="contactPhone"
            required
            inputMode="tel"
            pattern="[0-9]{10}"
            placeholder="10-digit number"
            className="input mt-1"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Preferred date & time</span>
        <input
          type="datetime-local"
          name="scheduledAt"
          required
          defaultValue={defaultDT}
          className="input mt-1"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Notes (optional)</span>
        <textarea name="notes" rows={2} className="input mt-1" />
      </label>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3 mt-2">
        <div>
          <div className="text-xs text-ink-900/50">Price</div>
          <div className="text-xl font-extrabold">{rupees(service.unitCents)}</div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={adding} className="btn-outline">
            {adding ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="btn-primary"
            disabled={adding}
          >
            View Cart →
          </button>
        </div>
      </div>
    </form>
  );
}
