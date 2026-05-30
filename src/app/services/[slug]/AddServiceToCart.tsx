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
};

export default function AddServiceToCart({ service }: Props) {
  const router = useRouter();
  const { addService } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  function add() {
    setAdding(true);
    addService({
      serviceId: service.id,
      slug: service.slug,
      title: service.title,
      imageUrl: service.imageUrl,
      unitCents: service.unitCents,
    });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-white/70 p-4 text-sm text-blue-900/80">
        <p className="font-semibold text-blue-900 mb-1">How booking works</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Add the service to your cart.</li>
          <li>Fill your address &amp; preferred date at checkout.</li>
          <li>Pay on appointment, or pay online.</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-blue-200 pt-4">
        <div>
          <div className="text-xs text-ink-900/50">Price</div>
          <div className="text-2xl font-extrabold">{rupees(service.unitCents)}</div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={add}
            disabled={adding}
            className="btn-outline flex-1 sm:flex-none whitespace-nowrap"
          >
            {adding ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={() => {
              add();
              router.push("/cart");
            }}
            className="btn-primary flex-1 sm:flex-none whitespace-nowrap"
            disabled={adding}
          >
            Book Now →
          </button>
        </div>
      </div>
    </div>
  );
}
