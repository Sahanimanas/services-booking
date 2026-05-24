"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { CartItem, ProductCartItem, ServiceCartItem } from "@/lib/cart-types";

const STORAGE_KEY = "gsm_cart_v1";

type State = { items: CartItem[]; couponCode: string | null; ready: boolean };

type Action =
  | { type: "HYDRATE"; items: CartItem[]; couponCode: string | null }
  | { type: "ADD_SERVICE"; item: Omit<ServiceCartItem, "cartId" | "kind"> }
  | { type: "ADD_PRODUCT"; item: Omit<ProductCartItem, "cartId" | "kind" | "qty">; qty?: number }
  | { type: "SET_QTY"; cartId: string; qty: number }
  | { type: "REMOVE"; cartId: string }
  | { type: "SET_COUPON"; code: string | null }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, couponCode: action.couponCode, ready: true };

    case "ADD_SERVICE": {
      const cartId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        ...state,
        items: [...state.items, { kind: "service", cartId, ...action.item }],
      };
    }

    case "ADD_PRODUCT": {
      const existing = state.items.find(
        (i): i is ProductCartItem => i.kind === "product" && i.productId === action.item.productId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartId === existing.cartId
              ? { ...i, qty: (i as ProductCartItem).qty + (action.qty ?? 1) }
              : i
          ),
        };
      }
      const cartId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return {
        ...state,
        items: [
          ...state.items,
          { kind: "product", cartId, qty: action.qty ?? 1, ...action.item },
        ],
      };
    }

    case "SET_QTY":
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.cartId === action.cartId && i.kind === "product"
              ? { ...i, qty: Math.max(1, action.qty) }
              : i
          )
          .filter((i) => i.kind !== "product" || (i as ProductCartItem).qty > 0),
      };

    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.cartId !== action.cartId) };

    case "SET_COUPON":
      return { ...state, couponCode: action.code };

    case "CLEAR":
      return { ...state, items: [], couponCode: null };
  }
}

type CartContextValue = State & {
  count: number;
  subtotalCents: number;
  addService: (item: Omit<ServiceCartItem, "cartId" | "kind">) => void;
  addProduct: (item: Omit<ProductCartItem, "cartId" | "kind" | "qty">, qty?: number) => void;
  setQty: (cartId: string, qty: number) => void;
  remove: (cartId: string) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

type Persisted = { items: CartItem[]; couponCode: string | null };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    couponCode: null,
    ready: false,
  });

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: Partial<Persisted> = raw ? JSON.parse(raw) : {};
      // Tolerate the older shape where we stored a plain CartItem[]
      const items: CartItem[] = Array.isArray(parsed)
        ? (parsed as CartItem[])
        : parsed.items ?? [];
      const couponCode = Array.isArray(parsed) ? null : parsed.couponCode ?? null;
      dispatch({ type: "HYDRATE", items, couponCode });
    } catch {
      dispatch({ type: "HYDRATE", items: [], couponCode: null });
    }
  }, []);

  // Persist on every change once hydrated
  useEffect(() => {
    if (!state.ready) return;
    try {
      const payload: Persisted = { items: state.items, couponCode: state.couponCode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
  }, [state.items, state.couponCode, state.ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce(
      (n, i) => n + (i.kind === "product" ? i.qty : 1),
      0
    );
    const subtotalCents = state.items.reduce(
      (n, i) => n + i.unitCents * (i.kind === "product" ? i.qty : 1),
      0
    );
    return {
      ...state,
      count,
      subtotalCents,
      addService: (item) => dispatch({ type: "ADD_SERVICE", item }),
      addProduct: (item, qty) => dispatch({ type: "ADD_PRODUCT", item, qty }),
      setQty: (cartId, qty) => dispatch({ type: "SET_QTY", cartId, qty }),
      remove: (cartId) => dispatch({ type: "REMOVE", cartId }),
      setCoupon: (code) => dispatch({ type: "SET_COUPON", code }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside <CartProvider>");
  return ctx;
}
