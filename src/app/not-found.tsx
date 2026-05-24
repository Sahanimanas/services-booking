import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center text-center px-4 py-16">
      <div>
        <div className="text-7xl mb-4">🔎</div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-ink-900/60 mt-2">
          The page you're looking for has moved or doesn't exist.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Back to home
        </Link>
      </div>
    </section>
  );
}
