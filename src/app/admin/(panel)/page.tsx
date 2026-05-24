import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import StatusPill from "./_components/StatusPill";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [bookings, services, products, users, recent, revenue] = await Promise.all([
    prisma.booking.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { service: true, user: true },
    }),
    prisma.booking.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
    }),
  ]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={String(bookings)} icon="📅" />
        <StatCard
          label="Revenue (booked)"
          value={rupees(revenue._sum.totalCents ?? 0)}
          icon="💸"
        />
        <StatCard label="Active Services" value={String(services)} icon="🛠" />
        <StatCard label="Registered Users" value={String(users)} icon="👥" />
      </div>

      <div className="card mt-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-lg">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-slate-700 text-sm font-semibold">
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-left">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => (
              <tr key={b.id} className="border-t border-slate-200/60">
                <td className="px-5 py-3 text-ink-900/70">
                  {new Date(b.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 font-medium">{b.service.title}</td>
                <td className="px-5 py-3 text-ink-900/70">
                  {b.user.name ?? b.user.email ?? b.user.phone}
                </td>
                <td className="px-5 py-3">
                  <StatusPill status={b.status} />
                </td>
                <td className="px-5 py-3 text-right font-semibold">{rupees(b.totalCents)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-ink-900/50">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickCard href="/admin/services" title="Manage services" desc="Add, edit, set price & dates" />
        <QuickCard href="/admin/products" title="Manage products" desc="Inventory & pricing" />
        <QuickCard href="/admin/localities" title="Manage localities" desc="Where you serve" />
      </div>
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs uppercase text-ink-900/50">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function QuickCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card p-5 hover:-translate-y-0.5 transition">
      <div className="font-bold">{title}</div>
      <div className="text-sm text-ink-900/60 mt-1">{desc}</div>
      <div className="mt-3 text-slate-700 text-sm font-semibold">Open →</div>
    </Link>
  );
}

