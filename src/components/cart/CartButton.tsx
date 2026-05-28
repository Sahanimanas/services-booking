"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 ring-1 ring-slate-200 text-slate-700 hover:bg-slate-200/70 transition"
      aria-label="Cart"
    >
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
        <path d="M3 4h2l2.4 12.3a2 2 0 002 1.7h8.2a2 2 0 002-1.6L21 8H6" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
