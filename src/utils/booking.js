import { formatPrice } from "./currency.js";
import { normalizeIndianMobile } from "./validation.js";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

export const BUSINESS_WHATSAPP_NUMBER = "919898384604";
export const CONTACT_PHONE = "+91 98983 84604";
export const CONTACT_PHONE_RAW = "9898384604";
export const CONTACT_EMAIL = "shrivajewelss@gmail.com";
export const INSTAGRAM_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_INSTAGRAM_URL) || "https://www.instagram.com/shriva._jewels/";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61594874023954";
export const PINTEREST_URL = "https://in.pinterest.com/shrivajewelss/";
export const hasWhatsAppNumber = true;

  export function generateOrderNumber() {
    const now = new Date(Date.now() + 5.5 * 3600e3);
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let randPart = "";
    for (let i = 0; i < 4; i += 1) {
      randPart += chars[Math.floor(Math.random() * chars.length)];
    }
    return `SJ-${datePart}-${randPart}`;
  }

  /**
   * Saves a WhatsApp booking/order directly into Supabase `orders` and `order_items`.
   * Uses client-generated UUID + return=minimal so public checkout does not need SELECT RLS.
   */
  export async function createSupabaseOrder({ customer = {}, lines = [] }) {
    if (!isSupabaseConfigured || !supabase) {
      return { saved: false, orderNumber: generateOrderNumber() };
    }

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    const normalizedPhone = normalizeIndianMobile(customer.mobile) || String(customer.mobile || "").trim();
    const totalAmount = (lines || []).reduce(
      (sum, l) => sum + (Number(l.product?.price) || 0) * (l.quantity ?? 1),
      0
    );

    const orderRow = {
      id: orderId,
      order_number: orderNumber,
      customer_name: String(customer.name || "").trim(),
      phone: normalizedPhone,
      email: String(customer.email || "").trim() || null,
      address: String(customer.address || "").trim() || null,
      city: String(customer.city || "").trim() || null,
      state: String(customer.state || "").trim() || null,
      pincode: String(customer.pincode || "").trim() || null,
      total_amount: totalAmount,
      order_status: "pending",
      payment_status: "pending",
      payment_method: "whatsapp",
      customer_note: String(customer.message || customer.note || "").trim() || null,
    };

    const { error: orderError } = await supabase.from("orders").insert(orderRow);
    if (orderError) throw orderError;

    const itemRows = (lines || []).map((l) => {
      const qty = l.quantity ?? 1;
      const unitPrice = Number(l.product?.price) || 0;
      return {
        order_id: orderId,
        product_id: l.product?._uuid || null,
        product_name: l.product?.name || "Jewellery Item",
        sku: l.product?.sku || l.product?.code || null,
        quantity: qty,
        unit_price: unitPrice,
        subtotal: qty * unitPrice,
      };
    });

    if (itemRows.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
      if (itemsError) throw itemsError;
    }

    return { saved: true, orderId, orderNumber };
  }

  /**
   * Generates the complete formatted WhatsApp booking message according to Shriva Jewels specifications.
   * 
   * Required sections:
   * - SHRIVA JEWELS — NEW BOOKING REQUEST
   * - Customer Details (Name, Mobile, Email, optional Address, City, State, PIN, Message)
   * - Requested Products (Product name, Code, Quantity, Unit price, Line subtotal)
   * - Total number of pieces & Grand total in INR
   */
  export function generateBookingMessage({ customer = {}, lines = [], orderNumber = "" }) {
    const cust = customer || {};
    const normalizedMob = normalizeIndianMobile(cust.mobile);
    const mobileDisplay = normalizedMob || cust.mobile?.trim() || "";

    const customerLines = [
      `• Name: ${cust.name?.trim() || ""}`,
      `• Mobile: ${mobileDisplay}`,
      `• Email: ${cust.email?.trim() || ""}`,
    ];

    if (cust.address?.trim()) {
      customerLines.push(`• Address: ${cust.address.trim()}`);
    }
    if (cust.city?.trim()) {
      customerLines.push(`• City: ${cust.city.trim()}`);
    }
    if (cust.state?.trim()) {
      customerLines.push(`• State: ${cust.state.trim()}`);
    }
    if (cust.pincode?.trim()) {
      customerLines.push(`• PIN Code: ${cust.pincode.trim()}`);
    }
    const addlMsg = (cust.message || cust.note)?.trim();
    if (addlMsg) {
      customerLines.push(`• Additional Message: ${addlMsg}`);
    }

    const productLines = (lines || []).map((l, index) => {
      const unitPrice = l.product?.price ?? 0;
      const qty = l.quantity ?? 1;
      const lineSubtotal = unitPrice * qty;
      return [
        `${index + 1}. ${l.product?.name ?? "Jewellery Item"}`,
        `   • Product Code: ${l.product?.code ?? "—"}`,
        `   • Quantity: ${qty}`,
        `   • Unit Price: ${formatPrice(unitPrice)}`,
        `   • Line Subtotal: ${formatPrice(lineSubtotal)}`,
      ].join("\n");
    });

    const totalPieces = (lines || []).reduce((sum, l) => sum + (l.quantity ?? 1), 0);
    const grandTotal = (lines || []).reduce((sum, l) => sum + (l.product?.price ?? 0) * (l.quantity ?? 1), 0);

    const sections = [
      "*SHRIVA JEWELS — NEW BOOKING REQUEST*",
      ...(orderNumber ? [`*Order Number:* ${orderNumber}`] : []),
      "",
      "*Customer Details*",
      ...customerLines,
      "",
      "*Requested Products*",
      productLines.length > 0 ? productLines.join("\n\n") : "No items selected.",
      "",
      `*Total Pieces:* ${totalPieces}`,
      `*Grand Total:* ${formatPrice(grandTotal)}`,
    ];

    return sections.join("\n");
  }

  /**
   * Builds the wa.me URL for the business WhatsApp destination.
   */
  export function buildWhatsAppUrl(message, businessNumber = BUSINESS_WHATSAPP_NUMBER) {
    return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Fallback and secondary WhatsApp link helper.
   */
  export function buildWhatsAppLink(lines, subtotal, name = "", customer = {}) {
    const cust = { name, ...customer };
    const message = generateBookingMessage({ customer: cust, lines });
    return buildWhatsAppUrl(message);
  }

  /**
   * Copies text to the clipboard with resilient browser fallbacks.
   */
  export async function copyToClipboard(text) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to DOM fallback
      }
    }

    if (typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.setAttribute("aria-hidden", "true");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return Boolean(successful);
      } catch {
        return false;
      }
    }

    return false;
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
