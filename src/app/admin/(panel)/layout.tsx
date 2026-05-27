import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Icon, { type IconName } from "./_components/Icon";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex flex-col w-64 text-white bg-gradient-to-b from-indigo-700 via-blue-700 to-blue-800">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25 text-white">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            GSM Admin
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <NavItem href="/admin" label="Dashboard" icon="dashboard" />
          <NavItem href="/admin/bookings" label="Bookings" icon="calendar" />
          <NavItem href="/admin/services" label="Services" icon="wrench" />
          <NavItem href="/admin/products" label="Products" icon="package" />
          <NavItem href="/admin/discounts" label="Discounts & Sales" icon="tag" />
          <NavItem href="/admin/coupons" label="Coupons" icon="ticket" />
          <NavItem href="/admin/categories" label="Categories" icon="layers" />
          <NavItem href="/admin/localities" label="Localities" icon="pin" />
          <NavItem href="/admin/users" label="Users" icon="users" />
        </nav>
        <div className="p-3 border-t border-white/10 text-sm text-white/70">
          <div className="px-2 mb-2">
            Signed in as <b className="text-white/90">{user.email ?? user.name ?? "Admin"}</b>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-gradient-to-r from-indigo-50 via-blue-50 to-white border-b border-blue-100 flex items-center justify-between px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <Link href="/" className="text-sm font-medium text-blue-700 underline-grow hover:text-blue-900">
            ← Back to site
          </Link>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: IconName }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.95rem] font-medium text-white/80 transition-colors hover:bg-white/15 hover:text-white"
    >
      <Icon name={icon} className="h-5 w-5 text-white/70" />
      {label}
    </Link>
  );
}
