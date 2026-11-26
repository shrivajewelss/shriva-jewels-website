import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

/**
 * Aggregates customer profiles from orders and notes.
 */
export async function getCustomers({ search = "" } = {}) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, email, phone, city, state, total_amount, created_at, order_status")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Group by phone (primary Indian identifier) or email
  const map = new Map();

  for (const o of orders || []) {
    const key = (o.phone || o.email || "unknown").trim();
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: o.customer_name || "Valued Customer",
        phone: o.phone || "",
        email: o.email || "",
        city: o.city || "",
        state: o.state || "",
        total_orders: 0,
        total_spent: 0,
        last_order_date: o.created_at,
        orders: [],
      });
    }

    const c = map.get(key);
    c.total_orders += 1;
    c.total_spent += Number(o.total_amount) || 0;
    c.orders.push(o);
  }

  let list = Array.from(map.values()).map((c) => ({
    ...c,
    average_order_value: c.total_orders > 0 ? Math.round(c.total_spent / c.total_orders) : 0,
  }));

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }

  return { data: list, error: null };
}

export async function getCustomerDetails(identifier) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      total_amount,
      payment_status,
      order_status,
      customer_note,
      created_at,
      order_items ( id, product_id, product_name, sku, quantity, unit_price, subtotal )
    `)
    .or(`phone.eq.${identifier},email.eq.${identifier}`)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  // Fetch customer notes
  let notes = [];
  try {
    const { data: n } = await supabase
      .from("customer_notes")
      .select("id, notes, created_at, admin_profiles(full_name)")
      .eq("customer_phone", identifier)
      .order("created_at", { ascending: false });
    notes = n || [];
  } catch {
    // Graceful fallback if table is newly migrating
  }

  const first = orders?.[0];
  const totalSpent = (orders || []).reduce((s, o) => s + (Number(o.total_amount) || 0), 0);

  return {
    data: {
      phone: first?.phone || identifier,
      email: first?.email || "",
      name: first?.customer_name || "Valued Customer",
      address: first?.address || "",
      city: first?.city || "",
      state: first?.state || "",
      pincode: first?.pincode || "",
      total_orders: orders?.length || 0,
      total_spent: totalSpent,
      average_order_value: orders?.length ? Math.round(totalSpent / orders.length) : 0,
      orders: orders || [],
      notes,
    },
    error: null,
  };
}

export async function addCustomerNote(phone, email, noteText) {
  const { data: session } = await supabase.auth.getSession();
  const adminId = session?.session?.user?.id || null;

  const { data, error } = await supabase
    .from("customer_notes")
    .insert([
      {
        customer_phone: phone,
        customer_email: email || null,
        notes: noteText,
        created_by: adminId,
      },
    ])
    .select()
    .single();

  if (!error) {
    await logAdminActivity("add_customer_note", { customer_phone: phone, note: noteText });
  }

  return { data, error: error?.message };
}

/**
 * Official WhatsApp message templates for customer CRM communication.
 */
export const WHATSAPP_TEMPLATES = {
  order_confirmation: {
    id: "order_confirmation",
    title: "Order Confirmed",
    generateText: ({ customerName, orderNumber, totalAmount }) =>
      `Dear ${customerName},\n\nThank you for choosing Shriva Jewels! ✨\nYour order #${orderNumber} for ₹${totalAmount} has been confirmed and is being handpicked with care.\n\nWe will notify you once your package is dispatched.\n\nWarm regards,\nShriva Jewels Team`,
  },
  order_dispatched: {
    id: "order_dispatched",
    title: "Dispatched / Shipping Update",
    generateText: ({ customerName, orderNumber, trackingNumber = "" }) =>
      `Dear ${customerName},\n\nExciting news! Your Shriva Jewels order #${orderNumber} has been dispatched. 🚚\n${
        trackingNumber ? `Tracking Reference: ${trackingNumber}\n` : ""
      }\nIt will be delivered to your address shortly.\n\nWarm regards,\nShriva Jewels Team`,
  },
  order_delivered: {
    id: "order_delivered",
    title: "Order Delivered",
    generateText: ({ customerName, orderNumber }) =>
      `Dear ${customerName},\n\nYour order #${orderNumber} has been delivered! 💎\nWe hope you love your new jewellery. If you have any feedback or styling questions, feel free to reply to this message.\n\nThank you for shopping with Shriva Jewels!`,
  },
  payment_reminder: {
    id: "payment_reminder",
    title: "Payment Reminder",
    generateText: ({ customerName, orderNumber, totalAmount }) =>
      `Dear ${customerName},\n\nRegarding your Shriva Jewels booking #${orderNumber} for ₹${totalAmount}, please let us know if you'd like us to reserve the pieces for you.\n\nReply here to proceed with secure payment and dispatch.`,
  },
};

export function buildWhatsAppLink(phone, templateKey, params) {
  let cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const template = WHATSAPP_TEMPLATES[templateKey];
  const message = template
    ? template.generateText(params)
    : `Hello from Shriva Jewels regarding your order.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
