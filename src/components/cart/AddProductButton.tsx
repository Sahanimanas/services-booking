"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

type Props = {
  product: {
    id: string;
    slug: string;
    title: string;
    imageUrl: string | null;
    unitCents: number;
  };
  outOfStock?: boolean;
};

export default function AddProductButton({ product, outOfStock }: Props) {
  const { addProduct } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    if (outOfStock) return;
    addProduct({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      imageUrl: product.imageUrl,
      unitCents: product.unitCents,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={outOfStock}
      className="mt-3 w-full btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
