import type { Coupon } from "@prisma/client";

export type CouponValidationOk = {
  ok: true;
  coupon: Coupon;
  discountCents: number;
};

export type CouponValidationFail = {
  ok: false;
  error: string;
};

export type CouponValidation = CouponValidationOk | CouponValidationFail;

export function validateCoupon(
  coupon: Coupon | null | undefined,
  subtotalCents: number,
  now: Date = new Date()
): CouponValidation {
  if (!coupon) return { ok: false, error: "Invalid coupon code" };
  if (!coupon.active) return { ok: false, error: "Coupon is not active" };
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { ok: false, error: "Coupon is not yet active" };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) {
    return { ok: false, error: "Coupon has expired" };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: "Coupon usage limit reached" };
  }
  if (subtotalCents < coupon.minSubtotalCents) {
    const remaining = Math.ceil((coupon.minSubtotalCents - subtotalCents) / 100);
    return {
      ok: false,
      error: `Add ₹${remaining} more to use this coupon (min ₹${coupon.minSubtotalCents / 100})`,
    };
  }

  let discountCents = 0;
  if (coupon.kind === "PERCENT") {
    discountCents = Math.round((subtotalCents * coupon.value) / 100);
    if (coupon.maxDiscountCents != null) {
      discountCents = Math.min(discountCents, coupon.maxDiscountCents);
    }
  } else {
    discountCents = coupon.value;
  }
  discountCents = Math.max(0, Math.min(discountCents, subtotalCents));
  return { ok: true, coupon, discountCents };
}

/**
 * Allocate a total discount across line subtotals proportionally.
 * Returns an array of integer discounts that sums exactly to `totalDiscountCents`.
 */
export function allocateDiscount(
  lineSubtotals: number[],
  totalDiscountCents: number
): number[] {
  if (totalDiscountCents <= 0 || lineSubtotals.length === 0) {
    return lineSubtotals.map(() => 0);
  }
  const total = lineSubtotals.reduce((a, b) => a + b, 0);
  if (total <= 0) return lineSubtotals.map(() => 0);

  const shares = lineSubtotals.map((s) =>
    Math.floor((totalDiscountCents * s) / total)
  );
  let allocated = shares.reduce((a, b) => a + b, 0);
  let remainder = totalDiscountCents - allocated;
  let i = 0;
  while (remainder > 0 && i < shares.length) {
    shares[i] += 1;
    remainder -= 1;
    i += 1;
  }
  // Cap each line so we never discount more than its own subtotal
  return shares.map((s, idx) => Math.min(s, lineSubtotals[idx]));
}
