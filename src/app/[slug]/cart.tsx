"use client";

import { createContext, use, useCallback, useMemo, useSyncExternalStore } from "react";
import type { CartItem, Product, Store } from "@/lib/types";

// O carrinho fica só no navegador do visitante (localStorage), um por vitrine.
const EMPTY: CartItem[] = [];
const memory = new Map<string, CartItem[]>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function load(key: string): CartItem[] {
  if (!memory.has(key)) {
    let items = EMPTY;
    try {
      const raw = localStorage.getItem(key);
      if (raw) items = JSON.parse(raw);
    } catch {
      // armazenamento indisponível: o carrinho vale só enquanto a página estiver aberta
    }
    memory.set(key, items);
  }
  return memory.get(key)!;
}

function save(key: string, items: CartItem[]) {
  memory.set(key, items);
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // mantém o carrinho igual entre abas abertas da mesma vitrine
  const onStorage = (event: StorageEvent) => {
    if (event.key?.startsWith("cultiva-cart:")) {
      memory.delete(event.key);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type CartContextValue = {
  store: Store;
  items: CartItem[];
  add: (product: Product) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ store, children }: { store: Store; children: React.ReactNode }) {
  const key = `cultiva-cart:${store.id}`;
  const items = useSyncExternalStore(subscribe, () => load(key), () => EMPTY);

  const add = useCallback(
    (product: Product) => {
      const current = load(key);
      const existing = current.find((item) => item.id === product.id);
      save(
        key,
        existing
          ? current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
          : [...current, { id: product.id, name: product.name, price: product.price, quantity: 1 }],
      );
    },
    [key],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      const current = load(key);
      save(
        key,
        quantity <= 0
          ? current.filter((item) => item.id !== id)
          : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    },
    [key],
  );

  const clear = useCallback(() => save(key, EMPTY), [key]);

  const value = useMemo(() => ({ store, items, add, setQuantity, clear }), [store, items, add, setQuantity, clear]);
  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const cart = use(CartContext);
  if (!cart) throw new Error("useCart precisa estar dentro de CartProvider");
  return cart;
}

export function cartTotals(items: CartItem[]) {
  return {
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    hasUnpriced: items.some((item) => item.price === null),
  };
}
