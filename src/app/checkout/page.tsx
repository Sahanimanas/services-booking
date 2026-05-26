import { getCurrentUser } from "@/lib/auth";
import CheckoutView from "./CheckoutView";

export const metadata = {
  title: "Checkout",
  description:
    "Complete your Global Service Mitra order — sign in or create an account to place it.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <div className="page-backdrop relative isolate overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=70"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-0 -z-10 h-96 w-1/2 object-cover opacity-[0.06]"
      />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout</h1>
        <p className="text-slate-600 mt-1">
          {user ? "Confirm and place your order." : "Sign in or register to place your order."}
        </p>
        <div className="mt-8">
          <CheckoutView
            user={
              user
                ? {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                  }
                : null
            }
          />
        </div>
      </section>
    </div>
  );
}
