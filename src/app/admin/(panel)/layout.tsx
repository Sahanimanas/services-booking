import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-brand-100">
        <div className="h-16 flex items-center px-6 border-b border-brand-100">
          <Link href="/admin" className="font-bold text-brand-700 text-lg">
            🛡 GSM Admin
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <NavItem href="/admin" label="Dashboard" icon="📊" />
          <NavItem href="/admin/bookings" label="Bookings" icon="📅" />
          <NavItem href="/admin/services" label="Services" icon="🛠" />
          <NavItem href="/admin/products" label="Products" icon="🛍" />
          <NavItem href="/admin/discounts" label="Discounts & Sales" icon="🏷" />
          <NavItem href="/admin/coupons" label="Coupons" icon="🎟" />
          <NavItem href="/admin/categories" label="Categories" icon="🗂" />
          <NavItem href="/admin/localities" label="Localities" icon="📍" />
          <NavItem href="/admin/users" label="Users" icon="👥" />
        </nav>
        <div className="p-3 border-t border-brand-100 text-xs text-ink-900/60">
          <div className="px-2 mb-2">
            Signed in as <b>{user.email ?? user.name ?? "Admin"}</b>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full btn-outline px-3 py-2 text-sm">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-brand-100 flex items-center justify-between px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <Link href="/" className="text-sm text-brand-600 hover:underline">
            ← Back to site
          </Link>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-900/80 hover:bg-brand-50 hover:text-brand-700"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}
