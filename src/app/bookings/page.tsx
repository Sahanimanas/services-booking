import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rupees } from "@/lib/format";
import Link from "next/link";
import CancelButton from "./CancelButton";

export const metadata = {
  title: "My Bookings",
  description: "View and manage your Global Service Mitra bookings.",
};

export const dynamic = "force-dynamic";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-200 text-gray-700",
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const user = await requireUser();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { service: true, locality: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold">My Bookings</h1>
      <p className="text-ink-900/60 mt-1">Everything you've booked with Global Service Mitra.</p>

      {searchParams.created && (
        <div className="mt-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
          ✅ Booking created successfully. Our team will reach out shortly.
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-ink-900/60">You haven't booked any services yet.</p>
          <Link href="/services" className="btn-primary mt-5 inline-flex">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-lg">{b.service.title}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      STATUS_CLASS[b.status] ?? ""
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="text-sm text-ink-900/60 mt-1">
                  📍 {b.locality.name} · {b.address}
                </div>
                <div className="text-sm text-ink-900/60">
                  📅 {new Date(b.scheduledAt).toLocaleString()}
                </div>
                <div className="text-sm text-ink-900/60">
                  ☎ {b.contactName} · {b.contactPhone}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-900/50">Amount</div>
                <div className="text-xl font-extrabold">{rupees(b.totalCents)}</div>
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <CancelButton id={b.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
