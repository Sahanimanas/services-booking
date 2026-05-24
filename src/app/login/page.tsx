import LoginCard from "./LoginCard";
import Link from "next/link";

export const metadata = {
  title: "Sign in",
  description: "Sign in to Global Service Mitra with your email or mobile number.",
};

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <LoginCard next={searchParams.next ?? "/"} />
        <p className="text-center text-sm text-ink-900/70 mt-6">
          Don't have an account?{" "}
          <Link
            href={`/register${searchParams.next ? `?next=${searchParams.next}` : ""}`}
            className="text-accent-600 font-semibold hover:underline"
          >
            Register Now
          </Link>
        </p>
      </div>
    </section>
  );
}
