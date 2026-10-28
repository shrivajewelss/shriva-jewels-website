// Client-side mirror of server/validation/booking.js (UX only — the server is authoritative).
export function normalizeIndianMobile(input) {
  let d = String(input ?? "").replace(/[\s\-()+.]/g, "");
  if (!/^\d+$/.test(d)) return null;
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export function validateForm(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!normalizeIndianMobile(f.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (f.deliveryPreference === "delivery" && f.address.trim().length < 6) e.address = "Please add a delivery address.";
  return e;
}
