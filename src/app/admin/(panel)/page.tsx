import Link from "next/link";
import { prisma } from "@/lib/db";
import { rupees } from "@/lib/format";
import StatusPill from "./_components/StatusPill";
import Icon, { type IconName } from "./_components/Icon";

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Bookings"
          value={String(bookings)}
          icon="calendar"
          tone="sky"
        />
        <StatCard
          label="Revenue (booked)"
          value={rupees(revenue._sum.totalCents ?? 0)}
          icon="wallet"
          tone="emerald"
        />
        <StatCard label="Active Services" value={String(services)} icon="wrench" tone="violet" />
        <StatCard label="Registered Users" value={String(users)} icon="users" tone="amber" />
      </div>

      <div className="card mt-8 shadow-lg shadow-slate-900/[0.04] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <h2 className="font-bold text-xl tracking-tight text-indigo-950">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-blue-700 text-sm font-semibold hover:text-blue-900"
          >
            View all →
          </Link>
        </div>
        <table className="w-full text-[0.95rem]">
          <thead className="bg-slate-50 text-left">
            <tr className="text-xs uppercase tracking-wide text-ink-900/50">
              <th className="px-6 py-3.5 font-semibold">When</th>
              <th className="px-6 py-3.5 font-semibold">Service</th>
              <th className="px-6 py-3.5 font-semibold">User</th>
              <th className="px-6 py-3.5 font-semibold">Status</th>
              <th className="px-6 py-3.5 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => (
              <tr key={b.id} className="border-t border-slate-200/60 hover:bg-slate-50/60">
                <td className="px-6 py-4 text-ink-900/70">
                  {new Date(b.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium">{b.service.title}</td>
                <td className="px-6 py-4 text-ink-900/70">
                  {b.user.name ?? b.user.email ?? b.user.phone}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={b.status} />
                </td>
                <td className="px-6 py-4 text-right font-semibold">{rupees(b.totalCents)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-ink-900/50">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <QuickCard
          href="/admin/services"
          title="Manage services"
          desc="Add, edit, set price & dates"
          icon="wrench"
        />
        <QuickCard
          href="/admin/products"
          title="Manage products"
          desc="Inventory & pricing"
          icon="package"
        />
        <QuickCard
          href="/admin/localities"
          title="Manage localities"
          desc="Where you serve"
          icon="pin"
        />
      </div>
    </>
  );
}

const TONES: Record<
  string,
  { card: string; tile: string; value: string }
> = {
  sky: {
    card: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-100",
    tile: "bg-sky-100 text-sky-600",
    value: "text-sky-900",
  },
  emerald: {
    card: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100",
    tile: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-900",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100",
    tile: "bg-violet-100 text-violet-600",
    value: "text-violet-900",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
    tile: "bg-amber-100 text-amber-600",
    value: "text-amber-900",
  },
};

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: IconName;
  tone: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div
      className={`card p-6 border ${t.card} shadow-lg shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/[0.07]`}
    >
      <div className="flex items-center justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${t.tile}`}>
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
          {label}
        </span>
      </div>
      <div className={`mt-4 text-3xl font-extrabold tracking-tight ${t.value}`}>{value}</div>
    </div>
  );
}

function QuickCard({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: IconName;
}) {
  return (
    <Link
      href={href}
      className="card group p-6 border bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 shadow-lg shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/[0.07]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div className="mt-4 font-bold text-lg tracking-tight text-indigo-950">{title}</div>
      <div className="text-[0.95rem] text-ink-900/60 mt-1">{desc}</div>
      <div className="mt-3 text-indigo-700 text-sm font-semibold">Open →</div>
    </Link>
  );
}

