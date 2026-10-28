import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { productsById } from "../data/products.js";

const KEY = "shriva.cart.v1";
export const MAX_QTY = 20;
const clamp = (n) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(n) || 1)));

// Only { id, quantity } is stored. Names and prices are always re-read from the catalogue.
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => productsById[i?.id]).map((i) => ({ id: i.id, quantity: clamp(i.quantity) })) : [];
  } catch { return []; }
}

function reducer(items, a) {
  switch (a.type) {
    case "add": {
      const q = clamp(a.quantity ?? 1);
      const found = items.find((i) => i.id === a.id);
      if (!productsById[a.id]) return items;
      return found ? items.map((i) => (i.id === a.id ? { ...i, quantity: clamp(i.quantity + q) } : i)) : [...items, { id: a.id, quantity: q }];
    }
    case "setQty": return a.quantity < 1 ? items.filter((i) => i.id !== a.id) : items.map((i) => (i.id === a.id ? { ...i, quantity: clamp(a.quantity) } : i));
    case "remove": return items.filter((i) => i.id !== a.id);
    case "clear": return [];
    case "replace": return a.items;
    default: return items;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ } }, [items]);
  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === KEY) dispatch({ type: "replace", items: load() }); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => {
    const lines = items.map((i) => ({ ...i, product: productsById[i.id] }));
    return {
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.product.price * l.quantity, 0),
      add: (id, quantity = 1) => dispatch({ type: "add", id, quantity }),
      setQuantity: (id, quantity) => dispatch({ type: "setQty", id, quantity }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
