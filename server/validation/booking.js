import { productsById } from "../../src/data/products.js";

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const clean = (v, max) =>
  String(v ?? "").replace(CONTROL, "").replace(/\r\n?/g, "\n").trim().slice(0, max);

/** Normalise an Indian mobile number to 10 digits, or return null. */
export function normalizeIndianMobile(input) {
  let d = String(input ?? "").replace(/[\s\-()+.]/g, "");
  if (!/^\d+$/.test(d)) return null;
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/**
 * Validates an untrusted booking payload. Prices/names are NEVER read from the client:
 * only product ids + quantities are accepted and everything else comes from the catalogue.
 */
export function validateBooking(body) {
  const errors = {};
  const b = body && typeof body === "object" ? body : {};

  const name = clean(b.name, 80);
  if (name.length < 2) errors.name = "Please enter your name.";

  const mobile = normalizeIndianMobile(b.mobile);
  if (!mobile) errors.mobile = "Enter a valid 10-digit Indian mobile number.";

  const pref = b.deliveryPreference ? String(b.deliveryPreference) : "";
  if (pref && !["collection", "delivery"].includes(pref))
    errors.deliveryPreference = "Choose collection or delivery.";

  const address = clean(b.address, 300);
  if (pref === "delivery" && address.length < 6)
    errors.address = "Please add a delivery address.";

  const note = clean(b.note, 500);

  const items = [];
  if (!Array.isArray(b.items) || b.items.length === 0) errors.items = "Your bag is empty.";
  else if (b.items.length > 63) errors.items = "Too many items.";
  else {
    const seen = new Set();
    for (const it of b.items) {
      const product = productsById[it?.id];
      const qty = Number(it?.quantity);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20 || seen.has(it.id)) {
        errors.items = "One or more items in your bag are invalid. Please review your bag.";
        break;
      }
      seen.add(it.id);
      items.push({
        id: product.id, code: product.code, name: product.name,
        quantity: qty, unitPrice: product.price, lineTotal: product.price * qty,
      });
    }
  }

  const idempotencyKey = clean(b.idempotencyKey, 80);
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(idempotencyKey)) errors.idempotencyKey = "Missing request key.";

  if (Object.keys(errors).length) return { ok: false, errors };
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  return {
    ok: true,
    value: {
      name, mobile, deliveryPreference: pref || null,
      address: pref === "delivery" ? address : null, note: note || null,
      items, subtotal, idempotencyKey,
    },
  };
}
