import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import { effectiveDiscountPct, effectiveUnitCents, isOnSale } from "@/lib/pricing";
import DeleteRowButton from "@/components/DeleteRowButton";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    include: { category: true, _count: { select: { bookings: true, availabilities: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Link href="/admin/services/new" className="btn-primary px-5 py-2.5">
          + Add Service
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3">Bookings</th>
              <th className="px-5 py-3">Slots</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t border-brand-100/60">
                <td className="px-5 py-3 font-medium">{s.title}</td>
                <td className="px-5 py-3 text-ink-900/70">{s.category.name}</td>
                <td className="px-5 py-3">
                  <div className="font-semibold">{rupees(effectiveUnitCents(s))}</div>
                  {effectiveDiscountPct(s) > 0 && (
                    <div className="text-xs text-ink-900/50">
                      {effectiveDiscountPct(s)}% off
                      {isOnSale(s) && <span className="ml-1 text-brand-600">· on sale</span>}
                    </div>
                  )}
                  {s.discountPct > 0 && effectiveDiscountPct(s) === 0 && (
                    <div className="text-xs text-ink-900/40">sale not active</div>
                  )}
                </td>
                <td className="px-5 py-3">{s.durationMin} min</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-3">{s._count.bookings}</td>
                <td className="px-5 py-3">{s._count.availabilities}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/services/${s.id}`}
                    className="text-brand-600 font-semibold mr-3"
                  >
                    Edit
                  </Link>
                  <DeleteRowButton url={`/api/admin/services/${s.id}`} />
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-ink-900/50">
                  No services yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
