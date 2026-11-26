import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "amber" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "processing", label: "Processing", color: "indigo" },
  { value: "shipped", label: "Shipped", color: "purple" },
  { value: "delivered", label: "Delivered", color: "emerald" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "returned", label: "Returned", color: "rose" },
];

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "amber" },
  { value: "paid", label: "Paid", color: "emerald" },
  { value: "failed", label: "Failed", color: "red" },
  { value: "refunded", label: "Refunded", color: "gray" },
];

export async function getOrders({ status = "", paymentStatus = "", search = "" } = {}) {
  let query = supabase
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
      payment_method,
      customer_note,
      created_at,
      updated_at,
      order_items ( id, order_id, product_id, product_name, sku, quantity, unit_price, subtotal )
    `)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("order_status", status.toLowerCase());
  if (paymentStatus) query = query.eq("payment_status", paymentStatus.toLowerCase());
  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  const formatted = (data || []).map((o) => ({
    ...o,
    items_count: (o.order_items || []).reduce((s, i) => s + (i.quantity || 1), 0),
    total_amount: Number(o.total_amount) || 0,
  }));

  return { data: formatted, error: null };
}

export async function getOrderById(orderId) {
  const { data: order, error } = await supabase
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
      payment_method,
      customer_note,
      created_at,
      updated_at,
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        sku,
        quantity,
        unit_price,
        subtotal
      )
    `)
    .eq("id", orderId)
    .single();

  if (error) return { data: null, error: error.message };

  // Fetch product details for images / fallback metadata
  const productIds = (order.order_items || []).map((i) => i.product_id).filter(Boolean);
  let productsMap = {};

  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("id, name, slug, sku, image_url")
      .in("id", productIds);

    (prods || []).forEach((p) => {
      productsMap[p.id] = {
        name: p.name,
        sku: p.sku,
        image_url: p.image_url || "/images/products/p02.jpg",
      };
    });
  }

  const items = (order.order_items || []).map((item) => ({
    ...item,
    product_name: item.product_name || productsMap[item.product_id]?.name || `Product (${item.product_id})`,
    product_image: productsMap[item.product_id]?.image_url || "/images/products/p02.jpg",
    unit_price: Number(item.unit_price) || 0,
    subtotal: Number(item.subtotal) || 0,
  }));

  return {
    data: {
      ...order,
      items,
      total_amount: Number(order.total_amount) || 0,
    },
    error: null,
  };
}

export async function updateOrderStatus(orderId, newStatus, note = "") {
  const normalizedNewStatus = String(newStatus || "").toLowerCase();

  const { data: currentOrder, error: fetchErr } = await supabase
    .from("orders")
    .select("id, order_number, order_status, order_items(product_id, quantity)")
    .eq("id", orderId)
    .single();

  if (fetchErr) return { error: fetchErr.message };

  const previousStatus = String(currentOrder.order_status || "").toLowerCase();

  // 1. Update order status
  const { data: updated, error: updateErr } = await supabase
    .from("orders")
    .update({
      order_status: normalizedNewStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateErr) return { error: updateErr.message };

  // 2. Inventory Policy: If transitioning to cancelled or returned, restore inventory via RPC
  if (
    (normalizedNewStatus === "cancelled" || normalizedNewStatus === "returned") &&
    previousStatus !== "cancelled" &&
    previousStatus !== "returned"
  ) {
    const items = currentOrder.order_items || [];
    for (const item of items) {
      if (!item.product_id || !item.quantity) continue;

      const { data: updatedQty, error: rpcErr } = await supabase.rpc("adjust_inventory", {
        p_product_id: item.product_id,
        p_delta: item.quantity,
        p_movement_type: "return",
        p_note: note || `Order ${currentOrder.order_number} marked ${normalizedNewStatus}`,
      });
      if (rpcErr) {
        console.warn("Inventory restore warning:", rpcErr.message);
      } else if (updatedQty != null) {
        await supabase
          .from("products")
          .update({ units: updatedQty, updated_at: new Date().toISOString() })
          .eq("id", item.product_id);
      }
    }
  }

  await logAdminActivity(
    "order_status_update",
    {
      order_id: orderId,
      order_number: currentOrder.order_number,
      from: previousStatus,
      to: normalizedNewStatus,
      note,
    },
    { entityType: "order", entityId: orderId }
  );

  return { data: updated, error: null };
}

export async function updatePaymentStatus(orderId, newPaymentStatus) {
  const normalizedPaymentStatus = String(newPaymentStatus || "").toLowerCase();

  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: normalizedPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (!error) {
    await logAdminActivity(
      "payment_status_update",
      {
        order_id: orderId,
        new_payment_status: normalizedPaymentStatus,
      },
      { entityType: "order", entityId: orderId }
    );
  }

  return { data, error: error?.message };
}
