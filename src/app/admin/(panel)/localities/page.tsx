import { prisma } from "@/lib/db";
import LocalityManager from "./LocalityManager";

export const dynamic = "force-dynamic";

export default async function AdminLocalitiesPage() {
  const localities = await prisma.locality.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Localities</h1>
      <p className="text-sm text-ink-900/60 mb-6">
        Define the areas you serve. Users will choose from these when booking.
      </p>
      <LocalityManager initial={localities.map((l) => ({
        id: l.id,
        name: l.name,
        city: l.city,
        pincode: l.pincode ?? "",
        active: l.active,
        bookings: l._count.bookings,
      }))} />
    </>
  );
}
