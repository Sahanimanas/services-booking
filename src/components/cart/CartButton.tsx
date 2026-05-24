"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-brand-100 hover:bg-brand-50 transition"
      aria-label="Cart"
    >
      <span className="text-lg">🛒</span>
      {ready && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
