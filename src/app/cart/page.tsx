import CartView from "./CartView";

export const metadata = {
  title: "Your Cart",
  description: "Review the services and products in your Global Service Mitra cart before checkout.",
};

export default function CartPage() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold">Your Cart</h1>
      <p className="text-ink-900/60 mt-1">
        Review your items. You'll sign in only when you checkout.
      </p>
      <div className="mt-8">
        <CartView />
      </div>
    </section>
  );
}
