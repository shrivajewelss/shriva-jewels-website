import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export const ORDER_STATUSES = [
  { value: "Pending", label: "Pending", color: "amber" },
  { value: "Confirmed", label: "Confirmed", color: "blue" },
  { value: "Processing", label: "Processing", color: "indigo" },
  { value: "Shipped", label: "Shipped", color: "purple" },
  { value: "Delivered", label: "Delivered", color: "emerald" },
  { value: "Cancelled", label: "Cancelled", color: "red" },
  { value: "Returned", label: "Returned", color: "rose" },
];

export const PAYMENT_STATUSES = [
  { value: "Pending", label: "Pending", color: "amber" },
  { value: "Paid", label: "Paid", color: "emerald" },
  { value: "Failed", label: "Failed", color: "red" },
  { value: "Refunded", label: "Refunded", color: "gray" },
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
      created_at,
      updated_at,
      order_items ( id, product_id, quantity, unit_price, subtotal )
    `)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("order_status", status);
  if (paymentStatus) query = query.eq("payment_status", paymentStatus);
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
      created_at,
      updated_at,
      order_items (
        id,
        order_id,
        product_id,
        sku,
        quantity,
        unit_price,
        subtotal
      )
    `)
    .eq("id", orderId)
    .single();

  if (error) return { data: null, error: error.message };

  // Fetch product details for the items
  const productIds = (order.order_items || []).map((i) => i.product_id);
  let productsMap = {};

  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        sku,
        product_images ( image_url, sort_order )
      `)
      .in("id", productIds);

    (prods || []).forEach((p) => {
      const sortedImgs = (p.product_images || []).sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      productsMap[p.id] = {
        name: p.name,
        sku: p.sku,
        image_url: sortedImgs[0]?.image_url || "/images/products/p02.jpg",
      };
    });
  }

  const items = (order.order_items || []).map((item) => ({
    ...item,
    product_name: productsMap[item.product_id]?.name || `Product (${item.product_id})`,
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
  const { data: currentOrder, error: fetchErr } = await supabase
    .from("orders")
    .select("id, order_number, order_status, order_items(product_id, quantity)")
    .eq("id", orderId)
    .single();

  if (fetchErr) return { error: fetchErr.message };

  const previousStatus = currentOrder.order_status;

  // 1. Update order status
  const { data: updated, error: updateErr } = await supabase
    .from("orders")
    .update({
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateErr) return { error: updateErr.message };

  // 2. Inventory Policy: If transitioning to Cancelled or Returned, restore inventory!
  if (
    (newStatus === "Cancelled" || newStatus === "Returned") &&
    previousStatus !== "Cancelled" &&
    previousStatus !== "Returned"
  ) {
    const items = currentOrder.order_items || [];
    for (const item of items) {
      if (!item.product_id || !item.quantity) continue;

      const { data: curInv } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("product_id", item.product_id)
        .single();

      if (curInv) {
        const prevStock = curInv.quantity ?? 0;
        const newStock = prevStock + item.quantity;

        await supabase
          .from("inventory")
          .update({ quantity: newStock, updated_at: new Date().toISOString() })
          .eq("id", curInv.id);

        const { data: session } = await supabase.auth.getSession();
        await supabase.from("stock_movements").insert([
          {
            product_id: item.product_id,
            movement_type: newStatus === "Cancelled" ? "cancellation_restored" : "return_restored",
            previous_stock: prevStock,
            new_stock: newStock,
            admin_id: session?.session?.user?.id || null,
          },
        ]);
      }
    }
  }

  await logAdminActivity("order_status_update", {
    order_id: orderId,
    order_number: currentOrder.order_number,
    from: previousStatus,
    to: newStatus,
    note,
  });

  return { data: updated, error: null };
}

export async function updatePaymentStatus(orderId, newPaymentStatus) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (!error) {
    await logAdminActivity("payment_status_update", {
      order_id: orderId,
      new_payment_status: newPaymentStatus,
    });
  }

  return { data, error: error?.message };
}
