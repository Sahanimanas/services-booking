import { prisma } from "@/lib/db";
import CouponManager from "./CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Coupons</h1>
      <p className="text-sm text-ink-900/60 mb-6">
        Customers enter these codes at the cart to get a discount.
      </p>
      <CouponManager
        initial={coupons.map((c) => ({
          id: c.id,
          code: c.code,
          description: c.description ?? "",
          kind: c.kind,
          value: c.value,
          minSubtotalCents: c.minSubtotalCents,
          maxDiscountCents: c.maxDiscountCents,
          startsAt: c.startsAt ? c.startsAt.toISOString().slice(0, 16) : "",
          expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 16) : "",
          usageLimit: c.usageLimit,
          usedCount: c.usedCount,
          active: c.active,
        }))}
      />
    </>
  );
}
