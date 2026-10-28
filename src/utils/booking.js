import { formatPrice } from "./currency.js";

const WA_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/shriva._jewels/";
export const hasWhatsAppNumber = Boolean(WA_NUMBER);

/** Customer-initiated wa.me link (a convenience — NOT the automatic business notification). */
export function buildWhatsAppLink(lines, subtotal, name = "") {
  const text = [
    "Hi Shriva Jewels, I'd like to book these pieces:", "",
    ...lines.map((l) => `• ${l.product.name} (Code ${l.product.code}) × ${l.quantity} — ${formatPrice(l.product.price * l.quantity)}`),
    "", `Subtotal: ${formatPrice(subtotal)}`, name ? `Name: ${name}` : "", "Please confirm availability. Thank you!",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export async function submitBooking(payload) {
  let res;
  try {
    res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  } catch {
    throw Object.assign(new Error("We couldn't reach the server. Check your connection — your bag is safe, please try again."), { network: true });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || "We couldn't submit your booking. Please try again."), { fieldErrors: data.errors, status: res.status });
  return data;
}

export async function fetchBooking(reference, token) {
  const res = await fetch(`/api/bookings/${encodeURIComponent(reference)}?token=${encodeURIComponent(token)}`);
  if (!res.ok) return null;
  return (await res.json()).booking;
}
