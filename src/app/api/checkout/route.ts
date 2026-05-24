import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { effectiveUnitCents } from "@/lib/pricing";
import { allocateDiscount, validateCoupon } from "@/lib/coupons";

const ServiceLine = z.object({
  serviceId: z.string().min(1),
  localityId: z.string().min(1),
  address: z.string().trim().min(5),
  contactName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(10),
  scheduledAt: z.string().min(1),
  notes: z.string().trim().nullable().optional(),
  unitCents: z.number().int().nonnegative(),
});

const ProductLine = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(100),
  unitCents: z.number().int().nonnegative(),
});

const Shipping = z
  .object({
    address: z.string().trim().min(5),
    contactName: z.string().trim().min(1),
    contactPhone: z.string().trim().min(10),
  })
  .nullable();

const Body = z.object({
  services: z.array(ServiceLine),
  products: z.array(ProductLine),
  shipping: Shipping.optional(),
  couponCode: z.string().trim().nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to checkout" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }
  const { services, products, shipping } = parsed.data;
  const rawCouponCode = parsed.data.couponCode?.trim().toUpperCase() || null;

  if (services.length === 0 && products.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }
  if (products.length > 0 && !shipping) {
    return NextResponse.json(
      { error: "Shipping details are required for products" },
      { status: 400 }
    );
  }

  // Authoritative lookups
  const serviceIds = Array.from(new Set(services.map((s) => s.serviceId)));
  const productIds = Array.from(new Set(products.map((p) => p.productId)));
  const localityIds = Array.from(new Set(services.map((s) => s.localityId)));

  const [dbServices, dbProducts, dbLocalities, dbCoupon] = await Promise.all([
    serviceIds.length
      ? prisma.service.findMany({ where: { id: { in: serviceIds }, active: true } })
      : Promise.resolve([]),
    productIds.length
      ? prisma.product.findMany({ where: { id: { in: productIds }, active: true } })
      : Promise.resolve([]),
    localityIds.length
      ? prisma.locality.findMany({ where: { id: { in: localityIds }, active: true } })
      : Promise.resolve([]),
    rawCouponCode
      ? prisma.coupon.findUnique({ where: { code: rawCouponCode } })
      : Promise.resolve(null),
  ]);

  const svcMap = new Map(dbServices.map((s) => [s.id, s]));
  const prodMap = new Map(dbProducts.map((p) => [p.id, p]));
  const locSet = new Set(dbLocalities.map((l) => l.id));

  for (const s of services) {
    if (!svcMap.has(s.serviceId)) {
      return NextResponse.json({ error: "A service in your cart is no longer available." }, { status: 400 });
    }
    if (!locSet.has(s.localityId)) {
      return NextResponse.json({ error: "We don't serve one of the selected localities." }, { status: 400 });
    }
    const at = new Date(s.scheduledAt);
    if (Number.isNaN(at.valueOf()) || at < new Date()) {
      return NextResponse.json({ error: "Choose a future time slot." }, { status: 400 });
    }
  }
  for (const p of products) {
    const dbP = prodMap.get(p.productId);
    if (!dbP) {
      return NextResponse.json({ error: "A product in your cart is no longer available." }, { status: 400 });
    }
    if (dbP.stock < p.qty) {
      return NextResponse.json({ error: `Not enough stock for ${dbP.title}` }, { status: 400 });
    }
  }

  // Build authoritative line subtotals (in DB-order: services first, then products)
  const serviceLineSubtotals = services.map((s) => effectiveUnitCents(svcMap.get(s.serviceId)!));
  const productLineSubtotals = products.map((p) => effectiveUnitCents(prodMap.get(p.productId)!) * p.qty);
  const allLineSubtotals = [...serviceLineSubtotals, ...productLineSubtotals];
  const subtotalCents = allLineSubtotals.reduce((a, b) => a + b, 0);

  // Validate coupon
  let appliedCouponCode: string | null = null;
  let totalDiscountCents = 0;
  if (rawCouponCode) {
    const v = validateCoupon(dbCoupon ?? null, subtotalCents);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    appliedCouponCode = v.coupon.code;
    totalDiscountCents = v.discountCents;
  }

  // Allocate discount across all lines proportionally
  const allocations = allocateDiscount(allLineSubtotals, totalDiscountCents);
  const svcAllocations = allocations.slice(0, services.length);
  const prodAllocations = allocations.slice(services.length);
  const productOrderDiscount = prodAllocations.reduce((a, b) => a + b, 0);

  // Persist in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const createdBookings = await Promise.all(
      services.map((s, idx) => {
        const lineSub = serviceLineSubtotals[idx];
        const disc = svcAllocations[idx] ?? 0;
        return tx.booking.create({
          data: {
            userId: user.id,
            serviceId: s.serviceId,
            localityId: s.localityId,
            address: s.address,
            contactName: s.contactName,
            contactPhone: s.contactPhone.replace(/\D/g, "").slice(-10),
            scheduledAt: new Date(s.scheduledAt),
            notes: s.notes ?? null,
            subtotalCents: lineSub,
            discountCents: disc,
            totalCents: Math.max(0, lineSub - disc),
            couponCode: disc > 0 ? appliedCouponCode : null,
          },
        });
      })
    );

    let order: { id: string } | null = null;
    if (products.length > 0 && shipping) {
      const productsSubtotal = productLineSubtotals.reduce((a, b) => a + b, 0);
      const orderDiscount = productOrderDiscount;
      const orderTotal = Math.max(0, productsSubtotal - orderDiscount);

      order = await tx.productOrder.create({
        data: {
          userId: user.id,
          address: shipping.address,
          contactName: shipping.contactName,
          contactPhone: shipping.contactPhone.replace(/\D/g, "").slice(-10),
          subtotalCents: productsSubtotal,
          discountCents: orderDiscount,
          totalCents: orderTotal,
          couponCode: orderDiscount > 0 ? appliedCouponCode : null,
          items: {
            create: products.map((p) => {
              const dbP = prodMap.get(p.productId)!;
              return {
                productId: dbP.id,
                qty: p.qty,
                priceCents: effectiveUnitCents(dbP),
              };
            }),
          },
        },
        select: { id: true },
      });

      for (const p of products) {
        await tx.product.update({
          where: { id: p.productId },
          data: { stock: { decrement: p.qty } },
        });
      }
    }

    if (appliedCouponCode && totalDiscountCents > 0) {
      await tx.coupon.update({
        where: { code: appliedCouponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return {
      bookings: createdBookings.length,
      orderId: order?.id ?? null,
      coupon: appliedCouponCode,
      discountCents: totalDiscountCents,
      totalCents: Math.max(0, subtotalCents - totalDiscountCents),
    };
  });

  return NextResponse.json({ ok: true, ...result });
}
