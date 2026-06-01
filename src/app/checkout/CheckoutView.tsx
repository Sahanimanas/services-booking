"use client";

import { useEffect, useRef, useState } from "react";
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

  // — Auto-fill address via browser geolocation + OpenStreetMap Nominatim.
  // Uncontrolled inputs: we mutate the DOM value via ref so the form still
  // submits the geocoded value while the customer can edit/override it.
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const localityRef = useRef<HTMLSelectElement>(null);
  const [locating, setLocating] = useState(false);
  const [locateErr, setLocateErr] = useState<string | null>(null);

  async function useMyLocation() {
    setLocateErr(null);
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocateErr("Geolocation is not supported on this device.");
      return;
    }
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 60_000,
        })
      );
      const { latitude, longitude } = pos.coords;
      // Nominatim reverse-geocoding. Free, but rate-limited (1 req/sec).
      // For low-volume browser use this is fine; do NOT hammer it from servers.
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error("Could not look up that location.");
      const data = await res.json();
      const a = data?.address ?? {};
      const parts = [
        a.house_number,
        a.road || a.pedestrian || a.residential,
        a.neighbourhood || a.suburb,
        a.city_district || a.city || a.town || a.village,
        a.state,
        a.postcode,
      ].filter(Boolean);
      const addressText = parts.length > 0 ? parts.join(", ") : data?.display_name ?? "";
      if (addressRef.current && addressText) addressRef.current.value = addressText;

      // Try to auto-pick a matching locality from the dropdown.
      const candidates: string[] = [
        a.suburb,
        a.neighbourhood,
        a.city_district,
        a.city,
        a.town,
        a.village,
      ]
        .filter(Boolean)
        .map((s: string) => String(s).toLowerCase());
      const match = localities.find((l) => {
        const name = l.name.toLowerCase();
        return candidates.some((c) => c.includes(name) || name.includes(c));
      });
      if (match && localityRef.current) localityRef.current.value = match.id;
    } catch (e) {
      const err = e as GeolocationPositionError & { message?: string };
      if (err?.code === 1) setLocateErr("Permission denied. Please allow location access.");
      else if (err?.code === 2) setLocateErr("Couldn't determine your location.");
      else if (err?.code === 3) setLocateErr("Timed out getting your location.");
      else setLocateErr(err?.message ?? "Could not get your location.");
    } finally {
      setLocating(false);
    }
  }

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
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {!user ? (
          <InlineAuth onAuthed={(u) => setUser(u)} />
        ) : (
          <div className="rounded-2xl p-6 bg-blue-50 border border-blue-200 shadow-md shadow-blue-900/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-blue-700/80">Signed in as</div>
                <div className="font-semibold text-blue-900">
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
          <form onSubmit={onPlaceOrder} className="space-y-8">
            {needsServiceDetails && (
              <div className="rounded-2xl p-6 space-y-4 bg-emerald-50 border border-emerald-200 shadow-md shadow-emerald-900/5">
                <h2 className="font-bold text-lg text-emerald-900">Service details</h2>
                <p className="text-sm text-emerald-900/70 -mt-2">
                  We&apos;ll use these for every service in this order.
                </p>

                {/* Auto-fill address from the browser's current location */}
                <div className="rounded-xl border border-emerald-200 bg-white/70 p-3 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    <span aria-hidden>📍</span>
                    {locating ? "Locating…" : "Use my current location"}
                  </button>
                  <span className="text-xs text-emerald-900/70">
                    or fill in manually below
                  </span>
                </div>
                {locateErr && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 -mt-2">
                    {locateErr}
                  </div>
                )}

                <label className="block">
                  <span className="text-sm font-medium">Locality</span>
                  <select
                    ref={localityRef}
                    name="localityId"
                    required
                    defaultValue=""
                    className="input mt-1"
                  >
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
                    ref={addressRef}
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
              <div className="rounded-2xl p-6 space-y-4 bg-amber-50 border border-amber-200 shadow-md shadow-amber-900/5">
                <h2 className="font-bold text-lg text-amber-900">Shipping details (for products)</h2>
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

            <div className="rounded-2xl p-6 space-y-3 bg-violet-50 border border-violet-200 shadow-md shadow-violet-900/5">
              <h2 className="font-bold text-lg text-violet-900">Payment method</h2>
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
        <div className="rounded-2xl p-6 sticky top-24 bg-rose-50 border border-rose-200 shadow-md shadow-rose-900/5">
          <h2 className="font-bold text-lg mb-4 text-rose-900">Order Summary</h2>
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
