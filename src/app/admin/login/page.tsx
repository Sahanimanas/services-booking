import AdminLoginCard from "./AdminLoginCard";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <AdminLoginCard next={searchParams.next ?? "/admin"} />
      </div>
    </section>
  );
}
