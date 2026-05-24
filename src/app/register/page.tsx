import RegisterCard from "./RegisterCard";
import Link from "next/link";

export const metadata = {
  title: "Create account",
  description: "Create your Global Service Mitra account to book and manage home services.",
};

export default function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <RegisterCard next={searchParams.next ?? "/"} />
        <p className="text-center text-sm text-ink-900/70 mt-6">
          Already have an account?{" "}
          <Link
            href={`/login${searchParams.next ? `?next=${searchParams.next}` : ""}`}
            className="text-red-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
