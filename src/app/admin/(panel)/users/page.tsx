import { prisma } from "@/lib/db";
import UserRoleSelect from "./UserRoleSelect";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left">
            <tr>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Bookings</th>
              <th className="px-5 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-brand-100/60">
                <td className="px-5 py-3 text-ink-900/70">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 font-medium">{u.name ?? "—"}</td>
                <td className="px-5 py-3">{u.email ?? "—"}</td>
                <td className="px-5 py-3">{u.phone ?? "—"}</td>
                <td className="px-5 py-3">{u._count.bookings}</td>
                <td className="px-5 py-3">
                  <UserRoleSelect id={u.id} current={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
