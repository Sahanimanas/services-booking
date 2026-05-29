"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { rupees } from "@/lib/format";
import type { ProductCartItem, ServiceCartItem } from "@/lib/cart-types";
import InlineAuth from "./InlineAuth";

type Locality = { id: string; name: string; city: string };

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  localities: Locality[];
};

type PaymentMethod = "COD" | "ONLINE";

export default function CheckoutView({ user: initialUser, localities }: Props) {
  const router = useRouter();
  const { items, ready, subtotalCents, couponCode, setCoupon, clear } = useCart();
  const [user, setUser] = useState(initialUser);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

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
  const needsServiceDetails = services.length > 0;
  const needsShipping = products.length > 0;
  const totalCents = Math.max(0, subtotalCents - couponDiscount);

  // Default scheduled date — tomorrow at 10:00 local
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultDT = tomorrow.toISOString().slice(0, 16);

  async function placeOrder(form: HTMLFormElement) {
    setPlacing(true);
    setErr(null);
    const fd = new FormData(form);

    const serviceDetails = needsServiceDetails
      ? {
          localityId: String(fd.get("localityId") ?? ""),
          address: String(fd.get("address") ?? ""),
          contactName: String(fd.get("contactName") ?? ""),
          contactPhone: String(fd.get("contactPhone") ?? ""),
          scheduledAt: new Date(String(fd.get("scheduledAt"))).toISOString(),
          notes: String(fd.get("notes") ?? "") || null,
        }
      : null;

    const shipping = needsShipping
      ? {
          address: String(fd.get("shipAddress") ?? ""),
          contactName: String(fd.get("shipName") ?? ""),
          contactPhone: String(fd.get("shipPhone") ?? ""),
        }
      : null;

    const payload = {
      services: services.map((s) => ({
        serviceId: s.serviceId,
        unitCents: s.unitCents,
      })),
      products: products.map((p) => ({
        productId: p.productId,
        qty: p.qty,
        unitCents: p.unitCents,
      })),
      serviceDetails,
      shipping,
      couponCode: couponCode || null,
      paymentMethod,
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
    if (paymentMethod === "ONLINE") {
      setErr("Online UPI payment is coming soon — please use Cash on Service for now.");
      return;
    }
    placeOrder(e.currentTarget);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {!user ? (
          <InlineAuth onAuthed={(u) => setUser(u)} />
        ) : (
          <div className="card p-6 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-slate-500">Signed in as</div>
                <div className="font-semibold text-slate-900">
                  {user.name ?? user.email ?? user.phone}
                </div>
              </div>
              <span className="chip-off text-green-700 bg-green-50 border-green-200">
                ✓ Verified
              </span>
            </div>
          </div>
        )}

        {user && (
          <form onSubmit={onPlaceOrder} className="space-y-6">
            {needsServiceDetails && (
              <div className="card p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">Service details</h2>
                <p className="text-sm text-ink-900/60 -mt-2">
                  We&apos;ll use these for every service in this order.
                </p>

                <label className="block">
                  <span className="text-sm font-medium">Locality</span>
                  <select name="localityId" required defaultValue="" className="input mt-1">
                    <option value="" disabled>
                      Select your area
                    </option>
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

                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-medium">Contact name</span>
                    <input
                      name="contactName"
                      required
                      defaultValue={user.name ?? ""}
                      className="input mt-1"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Contact phone</span>
                    <input
                      name="contactPhone"
                      required
                      inputMode="tel"
                      pattern="[0-9]{10}"
                      defaultValue={user.phone ?? ""}
                      placeholder="10-digit number"
                      className="input mt-1"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium">Preferred date &amp; time</span>
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
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Anything our technician should know?"
                    className="input mt-1"
                  />
                </label>
              </div>
            )}

            {needsShipping && (
              <div className="card p-6 space-y-4">
                <h2 className="font-bold text-lg text-slate-900">Shipping details (for products)</h2>
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

            <div className="card p-6 space-y-3">
              <h2 className="font-bold text-lg text-slate-900">Payment method</h2>
              <PaymentChoice
                checked={paymentMethod === "COD"}
                onSelect={() => setPaymentMethod("COD")}
                title="Cash on Service"
                desc="Pay the technician in cash on your appointment, or pay on delivery for products."
                badge="No advance payment"
              />
              <PaymentChoice
                checked={paymentMethod === "ONLINE"}
                onSelect={() => setPaymentMethod("ONLINE")}
                title="UPI / Online (coming soon)"
                desc="Scan a UPI QR code to pay instantly. Available shortly."
                disabled
              />
            </div>

            {err && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {err}
              </div>
            )}

            <button type="submit" disabled={placing} className="btn-primary w-full">
              {placing
                ? "Placing order..."
                : `Place order · ${rupees(totalCents)} · Pay on service`}
            </button>
            <p className="text-xs text-ink-900/50 text-center">
              By placing the order you agree to our terms of service.
            </p>
          </form>
        )}
      </div>

      <aside className="lg:col-span-1">
        <div className="card p-6 sticky top-24">
          <h2 className="font-bold text-lg mb-4 text-slate-900">Order Summary</h2>
          <ul className="space-y-3 text-sm max-h-72 overflow-auto">
            {services.map((s) => (
              <li key={s.cartId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium truncate text-slate-900">{s.title}</span>
                  <span className="block text-xs text-slate-500">Service</span>
                </span>
                <span className="font-semibold whitespace-nowrap text-slate-900">
                  {rupees(s.unitCents)}
                </span>
              </li>
            ))}
            {products.map((p) => (
              <li key={p.cartId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium truncate text-slate-900">{p.title}</span>
                  <span className="block text-xs text-slate-500">Qty {p.qty}</span>
                </span>
                <span className="font-semibold whitespace-nowrap text-slate-900">
                  {rupees(p.unitCents * p.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{rupees(subtotalCents)}</span>
            </div>
            {couponCode && couponDiscount > 0 && (
              <div className="flex justify-between text-accent-600 font-semibold">
                <span>Coupon {couponCode}</span>
                <span>− {rupees(couponDiscount)}</span>
              </div>
            )}
            {couponCode && couponError && (
              <div className="text-xs text-red-700">{couponError}</div>
            )}
            <div className="flex justify-between font-extrabold text-lg pt-2 mt-1 border-t border-slate-200 text-slate-900">
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

function PaymentChoice({
  checked,
  onSelect,
  title,
  desc,
  badge,
  disabled,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={
        "w-full text-left rounded-xl border p-4 flex items-start gap-3 transition " +
        (disabled
          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          : checked
          ? "border-accent-500 ring-2 ring-accent-500/30 bg-accent-50/40"
          : "border-slate-200 hover:border-slate-300")
      }
    >
      <span
        className={
          "mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 " +
          (checked ? "border-accent-500" : "border-slate-300")
        }
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900">{title}</span>
          {badge && (
            <span className="text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-sm text-ink-900/60 mt-0.5">{desc}</span>
      </span>
    </button>
  );
}
