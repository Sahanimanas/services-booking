import { getCurrentUser } from "@/lib/auth";
import CheckoutView from "./CheckoutView";

export const metadata = {
  title: "Checkout",
  description: "Complete your Global Service Mitra order — sign in or create an account to place it.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <p className="text-ink-900/60 mt-1">
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
  );
}
