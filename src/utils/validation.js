export function normalizeIndianMobile(input) {
  let d = String(input ?? "").replace(/[\s\-()+.]/g, "");
  if (!/^\d+$/.test(d)) return null;
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validateForm(f) {
  const e = {};
  const name = String(f?.name ?? "").trim();
  const mobile = f?.mobile;
  const email = f?.email;
  const pincode = String(f?.pincode ?? "").trim();

  if (name.length < 2) {
    e.name = "Please enter your full name.";
  }

  if (!normalizeIndianMobile(mobile)) {
    e.mobile = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!validateEmail(email)) {
    e.email = "Please enter a valid email address.";
  }

  if (pincode && !/^\d{6}$/.test(pincode)) {
    e.pincode = "Enter a valid 6-digit PIN code.";
  }

  return e;
}
