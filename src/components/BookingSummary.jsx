import { formatPrice } from "../utils/currency.js";

export default function BookingSummary({ lines, subtotal }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-2xl">Booking summary</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {lines.map((l) => (
          <li key={l.id} className="flex justify-between gap-4">
            <span>{l.product.name} <span className="text-muted">· Code {l.product.code} · {formatPrice(l.product.price)} × {l.quantity}</span></span>
            <span className="shrink-0">{formatPrice(l.product.price * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between border-t border-line pt-4 font-medium"><span>Subtotal</span><span className="text-maroon">{formatPrice(subtotal)}</span></p>
      <p className="mt-3 text-xs leading-relaxed text-muted">This is a booking request, not a paid order. No online payment is taken — we'll confirm availability with you personally first.</p>
    </div>
  );
}
