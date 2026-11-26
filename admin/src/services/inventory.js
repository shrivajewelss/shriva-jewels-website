import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export const LOW_STOCK_THRESHOLD = 5;

export const MOVEMENT_TYPES = [
  { value: "adjustment", label: "Manual Adjustment" },
  { value: "purchase", label: "Purchase / Restock" },
  { value: "return", label: "Customer Return" },
  { value: "sale", label: "Sale Deduction" },
  { value: "damaged", label: "Damaged / Defective" },
];

export async function getInventoryList({ search = "", lowStockOnly = false } = {}) {
  const { data, error } = await supabase
    .from("inventory")
    .select(`
      id,
      product_id,
      quantity,
      low_stock_threshold,
      updated_at,
      products (
        id,
        name,
        sku,
        price,
        sale_price,
        status,
        category_id,
        units,
        image_url,
        categories ( name )
      )
    `)
    .order("quantity", { ascending: true });

  if (error) return { data: [], error: error.message };

  let list = (data || []).map((row) => {
    const threshold = row.low_stock_threshold ?? LOW_STOCK_THRESHOLD;
    const quantity = row.quantity ?? 0;
    return {
      id: row.id,
      product_id: row.product_id,
      quantity,
      low_stock_threshold: threshold,
      updated_at: row.updated_at,
      product_name: row.products?.name || "Unknown Product",
      sku: row.products?.sku || "—",
      price: Number(row.products?.price) || 0,
      status: row.products?.status || "draft",
      category_name: row.products?.categories?.name || "Uncategorized",
      is_low_stock: quantity <= threshold,
    };
  });

  if (lowStockOnly) {
    list = list.filter((item) => item.is_low_stock);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.product_name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category_name.toLowerCase().includes(q)
    );
  }

  return { data: list, error: null };
}

export async function adjustStock({ productId, newQuantity, movementType = "adjustment", reason = "" }) {
  const targetQty = Math.max(0, parseInt(newQuantity, 10) || 0);

  // 1. Get current stock
  const { data: currentInv, error: fetchErr } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", productId)
    .single();

  if (fetchErr) {
    return { error: fetchErr.message };
  }

  const prevStock = currentInv?.quantity ?? 0;
  const delta = targetQty - prevStock;

  if (delta === 0) {
    return { data: { previous_stock: prevStock, new_stock: targetQty }, error: null };
  }

  const validTypes = new Set(["purchase", "sale", "return", "adjustment", "damaged"]);
  const normalizedType = validTypes.has(movementType) ? movementType : "adjustment";

  // 2. Call Supabase SECURITY DEFINER RPC adjust_inventory
  const { data: updatedQty, error: rpcErr } = await supabase.rpc("adjust_inventory", {
    p_product_id: productId,
    p_delta: delta,
    p_movement_type: normalizedType,
    p_note: reason || null,
  });

  if (rpcErr) return { error: rpcErr.message };

  // Keep products.units in sync so storefront anon reads reflect live stock
  const finalQty = updatedQty ?? targetQty;
  await supabase.from("products").update({ units: finalQty, updated_at: new Date().toISOString() }).eq("id", productId);

  // 3. Record audit log
  await logAdminActivity(
    "inventory_adjustment",
    {
      product_id: productId,
      previous_stock: prevStock,
      new_stock: updatedQty ?? targetQty,
      quantity_delta: delta,
      movement_type: normalizedType,
      note: reason || null,
    },
    { entityType: "inventory", entityId: currentInv?.id || productId }
  );

  return { data: { previous_stock: prevStock, new_stock: updatedQty ?? targetQty }, error: null };
}

export async function getStockMovements(productId = null, limit = 50) {
  let query = supabase
    .from("stock_movements")
    .select(`
      id,
      product_id,
      admin_id,
      movement_type,
      quantity_delta,
      previous_stock,
      new_stock,
      note,
      created_at,
      products ( id, name, sku ),
      admin_profiles ( id, full_name )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  return { data: data || [], error: null };
}
