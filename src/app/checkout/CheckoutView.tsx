"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { rupees } from "@/lib/format";
import type { ProductCartItem, ServiceCartItem } from "@/lib/cart-types";
import InlineAuth from "./InlineAuth";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export default function CheckoutView({ user: initialUser }: Props) {
  const router = useRouter();
  const { items, ready, subtotalCents, couponCode, setCoupon, clear } = useCart();
  const [user, setUser] = useState(initialUser);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Re-validate coupon as cart/coupon change
  useEffect(() => {
    if (!couponCode) {
      setCouponDiscount(0);
      setCouponError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotalCents }),
      });
      if (cancelled) return;
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCouponDiscount(0);
        setCouponError(data?.error ?? "Coupon is no longer valid");
        return;
      }
      const data = await res.json();
      setCouponDiscount(Number(data.discountCents) || 0);
      setCouponError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [couponCode, subtotalCents]);

  if (!ready) {
    return <div className="text-ink-900/50">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-5xl mb-3">🛒</div>
        <p className="text-ink-900/60">Your cart is empty.</p>
        <Link href="/services" className="btn-primary mt-5 inline-flex">
          Browse Services
        </Link>
      </div>
    );
  }

  const services = items.filter((i): i is ServiceCartItem => i.kind === "service");
  const products = items.filter((i): i is ProductCartItem => i.kind === "product");
  const needsShipping = products.length > 0;
  const totalCents = Math.max(0, subtotalCents - couponDiscount);

  async function placeOrder(shipping?: {
    address: string;
    contactName: string;
    contactPhone: string;
  }) {
    setPlacing(true);
    setErr(null);
    const payload = {
      services: services.map((s) => ({
        serviceId: s.serviceId,
        localityId: s.localityId,
        address: s.address,
        contactName: s.contactName,
        contactPhone: s.contactPhone,
        scheduledAt: s.scheduledAt,
        notes: s.notes ?? null,
        unitCents: s.unitCents,
      })),
      products: products.map((p) => ({
        productId: p.productId,
        qty: p.qty,
        unitCents: p.unitCents,
      })),
      shipping: shipping ?? null,
      couponCode: couponCode || null,
    };
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPlacing(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error ?? "Could not place order");
      return;
    }
    clear();
    router.push("/bookings?created=1");
    router.refresh();
  }

  function onPlaceOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (needsShipping) {
      const fd = new FormData(e.currentTarget);
      placeOrder({
        address: String(fd.get("shipAddress") ?? ""),
        contactName: String(fd.get("shipName") ?? ""),
        contactPhone: String(fd.get("shipPhone") ?? ""),
      });
    } else {
      placeOrder();
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {!user ? (
          <InlineAuth onAuthed={(u) => setUser(u)} />
        ) : (
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-ink-900/50">Signed in as</div>
                <div className="font-semibold">{user.name ?? user.email ?? user.phone}</div>
              </div>
              <span className="chip-off text-green-700 bg-green-50 border-green-200">
                ✓ Verified
              </span>
            </div>
          </div>
        )}

        {user && (
          <form onSubmit={onPlaceOrder} className="card p-6 space-y-4">
            <h2 className="font-bold text-lg">Confirm & Pay</h2>

            {needsShipping && (
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="text-sm font-semibold">Shipping details (for products)</div>
                <input
                  name="shipName"
                  required
                  placeholder="Recipient name"
                  defaultValue={user.name ?? ""}
                  className="input"
                />
                <input
                  name="shipPhone"
                  required
                  inputMode="tel"
                  pattern="[0-9]{10}"
                  defaultValue={user.phone ?? ""}
                  placeholder="10-digit phone"
                  className="input"
                />
                <textarea
                  name="shipAddress"
                  rows={2}
                  required
                  placeholder="Full shipping address"
                  className="input"
                />
              </div>
            )}

            {err && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {err}
              </div>
            )}

            <button type="submit" disabled={placing} className="btn-primary w-full">
              {placing ? "Placing order..." : `Place order · ${rupees(totalCents)}`}
            </button>
            <p className="text-xs text-ink-900/50 text-center">
              By placing the order you agree to our terms of service.
            </p>
          </form>
        )}
      </div>

      <aside className="lg:col-span-1">
        <div className="card p-6 sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <ul className="space-y-3 text-sm max-h-72 overflow-auto">
            {services.map((s) => (
              <li key={s.cartId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium truncate">{s.title}</span>
                  <span className="block text-xs text-ink-900/50">
                    {new Date(s.scheduledAt).toLocaleString()}
                  </span>
                </span>
                <span className="font-semibold whitespace-nowrap">{rupees(s.unitCents)}</span>
              </li>
            ))}
            {products.map((p) => (
              <li key={p.cartId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium truncate">{p.title}</span>
                  <span className="block text-xs text-ink-900/50">Qty {p.qty}</span>
                </span>
                <span className="font-semibold whitespace-nowrap">
                  {rupees(p.unitCents * p.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t pt-3 mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-ink-900/70">
              <span>Subtotal</span>
              <span>{rupees(subtotalCents)}</span>
            </div>
            {couponCode && couponDiscount > 0 && (
              <div className="flex justify-between text-red-700 font-semibold">
                <span>Coupon {couponCode}</span>
                <span>− {rupees(couponDiscount)}</span>
              </div>
            )}
            {couponCode && couponError && (
              <div className="text-xs text-red-700">{couponError}</div>
            )}
            <div className="flex justify-between font-extrabold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <span>{rupees(totalCents)}</span>
            </div>
          </div>

          {couponCode && (
            <button
              type="button"
              onClick={() => setCoupon(null)}
              className="block mt-3 text-xs text-red-600 font-semibold mx-auto"
            >
              Remove coupon
            </button>
          )}

          <Link
            href="/cart"
            className="block mt-4 text-center text-slate-700 text-sm font-semibold hover:underline"
          >
            ← Edit cart
          </Link>
        </div>
      </aside>
    </div>
  );
}
