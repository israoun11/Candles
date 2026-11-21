import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem { id: string; name: string; price: number; qty: number; variant?: string }
interface Cart {
  items: CartItem[]; count: number; subtotal: number; open: boolean;
  setOpen: (o: boolean) => void; add: (i: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (id: string, variant: string | undefined, qty: number) => void; remove: (id: string, variant?: string) => void; clear: () => void;
}
const KEY = 'artisra-cart';
const Ctx = createContext<Cart | null>(null);
const same = (a: CartItem, id: string, v?: string) => a.id === id && a.variant === v;

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ } }, [items]);
  const value = useMemo<Cart>(() => ({
    items, open, setOpen,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
    add: (i, qty = 1) => setItems((cur) => cur.some((c) => same(c, i.id, i.variant))
      ? cur.map((c) => (same(c, i.id, i.variant) ? { ...c, qty: c.qty + qty } : c)) : [...cur, { ...i, qty }]),
    setQty: (id, v, qty) => setItems((cur) => cur.flatMap((c) => (same(c, id, v) ? (qty > 0 ? [{ ...c, qty }] : []) : [c]))),
    clear: () => setItems([]),
    remove: (id, v) => setItems((cur) => cur.filter((c) => !same(c, id, v))),
  }), [items, open]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
