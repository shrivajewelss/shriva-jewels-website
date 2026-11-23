import { formatCurrency } from "./currency.js";
import { formatDate } from "./date.js";

export const BUSINESS_DETAILS = {
  name: "Shriva Jewels",
  tagline: "Jewellery That Speaks Your Style",
  website: "https://www.shriva.store",
  supportEmail: "care@shriva.store",
  supportPhone: "+91 98983 84604",
  city: "Surat, Gujarat, India",
};

export function generateInvoiceNumber(orderNumber, createdAt) {
  const d = new Date(createdAt || Date.now());
  const year = d.getFullYear();
  const cleanOrderNum = String(orderNumber || "0000").replace(/[^a-zA-Z0-9]/g, "");
  return `INV-SJ-${year}-${cleanOrderNum.slice(-4)}`;
}

export function triggerPrint() {
  window.print();
}
