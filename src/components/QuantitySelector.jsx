import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "../context/CartContext.jsx";

export default function QuantitySelector({ value, onChange, label = "Quantity", min = 1 }) {
  const b = "flex h-10 w-10 items-center justify-center text-maroon transition-colors hover:bg-sand disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-line bg-white">
      <button type="button" className={`${b} rounded-l-full`} aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}><Minus size={16} /></button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={`${b} rounded-r-full`} aria-label="Increase quantity" disabled={value >= MAX_QTY} onClick={() => onChange(value + 1)}><Plus size={16} /></button>
    </div>
  );
}
