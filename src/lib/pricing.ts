/**
 * Returns the effective discount percentage for an item, considering
 * its sale window. If saleStartsAt / saleEndsAt are set, the discount
 * only applies inside the window. If both are null, discountPct is always active.
 */
export function effectiveDiscountPct(
  item: {
    discountPct: number;
    saleStartsAt?: Date | string | null;
    saleEndsAt?: Date | string | null;
  },
  now: Date = new Date()
): number {
  if (!item.discountPct || item.discountPct <= 0) return 0;
  const startsAt = item.saleStartsAt ? new Date(item.saleStartsAt) : null;
  const endsAt = item.saleEndsAt ? new Date(item.saleEndsAt) : null;
  if (!startsAt && !endsAt) return item.discountPct;
  const afterStart = !startsAt || startsAt <= now;
  const beforeEnd = !endsAt || endsAt > now;
  return afterStart && beforeEnd ? item.discountPct : 0;
}

export function effectiveUnitCents(
  item: {
    priceCents: number;
    discountPct: number;
    saleStartsAt?: Date | string | null;
    saleEndsAt?: Date | string | null;
  },
  now: Date = new Date()
): number {
  const pct = effectiveDiscountPct(item, now);
  return Math.round(item.priceCents * (1 - pct / 100));
}

/** Whether an item is currently on a time-limited sale (not a permanent discount). */
export function isOnSale(
  item: {
    discountPct: number;
    saleStartsAt?: Date | string | null;
    saleEndsAt?: Date | string | null;
  },
  now: Date = new Date()
): boolean {
  if (!item.discountPct || item.discountPct <= 0) return false;
  if (!item.saleStartsAt && !item.saleEndsAt) return false;
  return effectiveDiscountPct(item, now) > 0;
}
