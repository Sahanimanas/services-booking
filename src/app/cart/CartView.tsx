"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useConfirm } from "@/components/ConfirmDialog";
import { rupees } from "@/lib/format";
import type { ProductCartItem, ServiceCartItem } from "@/lib/cart-types";

export default function CartView() {
  const { items, ready, subtotalCents, couponCode, setCoupon, setQty, remove, clear } = useCart();
  const confirm = useConfirm();
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Re-validate the applied coupon whenever the cart subtotal or coupon code changes
  useEffect(() => {
    if (!couponCode) {
      setCouponDiscount(0);
      setCouponError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setCouponBusy(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotalCents }),
      });
      if (cancelled) return;
      setCouponBusy(false);
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

  async function applyCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCouponError(null);
    setCouponBusy(true);
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponBusy(false);
      return;
    }
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotalCents }),
    });
    setCouponBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCouponError(data?.error ?? "Invalid coupon");
      return;
    }
    const data = await res.json();
    setCoupon(code);
    setCouponDiscount(Number(data.discountCents) || 0);
    setCouponInput("");
  }

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
  const total = Math.max(0, subtotalCents - couponDiscount);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {services.map((s) => (
          <div key={s.cartId} className="card p-5 flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl ?? "https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?w=300"}
              alt={s.title}
              className="w-24 h-24 rounded-xl object-cover bg-slate-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-block text-xs font-semibold text-slate-500 uppercase">
                    Service
                  </span>
                  <h3 className="font-bold truncate">{s.title}</h3>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{rupees(s.unitCents)}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-ink-900/60 space-y-0.5">
                <div>📍 {s.localityName}</div>
                <div className="truncate">🏠 {s.address}</div>
                <div>📅 {new Date(s.scheduledAt).toLocaleString()}</div>
                <div>
                  ☎ {s.contactName} · {s.contactPhone}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(s.cartId)}
                className="mt-3 text-red-600 text-xs font-semibold hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {products.map((p) => (
          <div key={p.cartId} className="card p-5 flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl ?? "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=300"}
              alt={p.title}
              className="w-24 h-24 rounded-xl object-cover bg-slate-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-block text-xs font-semibold text-slate-500 uppercase">
                    Product
                  </span>
                  <h3 className="font-bold truncate">{p.title}</h3>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{rupees(p.unitCents * p.qty)}</div>
                  <div className="text-xs text-ink-900/50">{rupees(p.unitCents)} ea</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(p.cartId, p.qty - 1)}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50"
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-semibold">{p.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(p.cartId, p.qty + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50"
                  aria-label="Increase"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => remove(p.cartId)}
                  className="ml-4 text-red-600 text-xs font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: "Clear cart",
                message: "Remove all items from your cart? This cannot be undone.",
                confirmText: "Clear cart",
                destructive: true,
              });
              if (ok) clear();
            }}
            className="text-sm text-ink-900/60 hover:text-red-600"
          >
            Clear cart
          </button>
          <Link href="/services" className="text-sm text-slate-700 font-semibold hover:underline">
            ← Continue browsing
          </Link>
        </div>
      </div>

      <aside className="lg:col-span-1">
        <div className="card p-6 sticky top-24">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <Row label={`Services (${services.length})`} value={rupees(
              services.reduce((n, s) => n + s.unitCents, 0)
            )} />
            <Row label={`Products (${products.reduce((n, p) => n + p.qty, 0)})`} value={rupees(
              products.reduce((n, p) => n + p.unitCents * p.qty, 0)
            )} />
            <Row label="Subtotal" value={rupees(subtotalCents)} bold />
            {couponCode && couponDiscount > 0 && (
              <Row
                label={`Coupon ${couponCode}`}
                value={`− ${rupees(couponDiscount)}`}
                accent
              />
            )}
            <div className="border-t pt-3 mt-2 flex justify-between font-extrabold text-lg">
              <span>Total</span>
              <span>{rupees(total)}</span>
            </div>
          </div>

          {/* Coupon UI */}
          <div className="mt-5">
            {!couponCode ? (
              <form onSubmit={applyCoupon} className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="COUPON CODE"
                  className="input flex-1 tracking-wider"
                />
                <button type="submit" disabled={couponBusy} className="btn-outline px-4">
                  {couponBusy ? "…" : "Apply"}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-bold text-slate-900">{couponCode}</span>{" "}
                  {couponDiscount > 0 ? (
                    <span className="text-ink-900/60">applied</span>
                  ) : (
                    <span className="text-red-700">— {couponError}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-xs text-red-600 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
            {!couponCode && couponError && (
              <p className="text-xs text-red-700 mt-2">{couponError}</p>
            )}
          </div>

          <Link href="/checkout" className="btn-primary w-full mt-5">
            Proceed to Checkout →
          </Link>
          <p className="text-xs text-ink-900/50 mt-3 text-center">
            You'll sign in or register at checkout.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between " +
        (accent ? "text-red-700 font-semibold" : "text-ink-900/70") +
        (bold ? " font-bold !text-ink-900" : "")
      }
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
