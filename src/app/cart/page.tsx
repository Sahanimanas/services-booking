import CartView from "./CartView";

export const metadata = {
  title: "Your Cart",
  description:
    "Review the services and products in your Global Service Mitra cart before checkout.",
};

export default function CartPage() {
  return (
    <div className="page-backdrop relative isolate overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=70"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 -z-10 h-96 w-1/2 object-cover opacity-[0.06]"
      />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Your Cart</h1>
        <p className="text-slate-600 mt-1">
          Review your items. You'll sign in only when you checkout.
        </p>
        <div className="mt-8">
          <CartView />
        </div>
      </section>
    </div>
  );
}
