import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import BookingStatusSelect from "./BookingStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const bookings = await prisma.booking.findMany({
    where: status ? { status: status as any } : undefined,
    include: { service: true, locality: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <div className="flex gap-2">
          {["", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
            <a
              key={s || "all"}
              href={s ? `/admin/bookings?status=${s}` : "/admin/bookings"}
              className={(status === s || (!status && !s)) ? "chip-on" : "chip-off"}
            >
              {s || "All"}
            </a>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Booked</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Locality</th>
              <th className="px-5 py-3">Scheduled</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-slate-200/60 align-top">
                <td className="px-5 py-3 text-ink-900/70 whitespace-nowrap">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium">{b.contactName}</div>
                  <div className="text-xs text-ink-900/60">{b.contactPhone}</div>
                  <div className="text-xs text-ink-900/60">
                    {b.user.email ?? b.user.phone}
                  </div>
                </td>
                <td className="px-5 py-3">{b.service.title}</td>
                <td className="px-5 py-3">
                  <div>{b.locality.name}</div>
                  <div className="text-xs text-ink-900/60 max-w-[200px] truncate" title={b.address}>
                    {b.address}
                  </div>
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {new Date(b.scheduledAt).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <BookingStatusSelect id={b.id} current={b.status} />
                </td>
                <td className="px-5 py-3 text-right font-semibold">{rupees(b.totalCents)}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-ink-900/50">
                  No bookings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
