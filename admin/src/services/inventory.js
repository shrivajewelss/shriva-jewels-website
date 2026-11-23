import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export const LOW_STOCK_THRESHOLD = 5;

export async function getInventoryList({ search = "", lowStockOnly = false } = {}) {
  const { data, error } = await supabase
    .from("inventory")
    .select(`
      id,
      product_id,
      quantity,
      updated_at,
      products (
        id,
        name,
        sku,
        price,
        status,
        category_id,
        categories ( name )
      )
    `)
    .order("quantity", { ascending: true });

  if (error) return { data: [], error: error.message };

  let list = (data || []).map((row) => ({
    id: row.id,
    product_id: row.product_id,
    quantity: row.quantity ?? 0,
    updated_at: row.updated_at,
    product_name: row.products?.name || "Unknown Product",
    sku: row.products?.sku || "—",
    price: Number(row.products?.price) || 0,
    status: row.products?.status || "active",
    category_name: row.products?.categories?.name || "Uncategorized",
    is_low_stock: (row.quantity ?? 0) <= LOW_STOCK_THRESHOLD,
  }));

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

  if (fetchErr && fetchErr.code !== "PGRST116") {
    return { error: fetchErr.message };
  }

  const prevStock = currentInv?.quantity ?? 0;
  const delta = targetQty - prevStock;

  // 2. Update or insert inventory
  let updateErr = null;
  if (currentInv) {
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: targetQty, updated_at: new Date().toISOString() })
      .eq("id", currentInv.id);
    updateErr = error;
  } else {
    const { error } = await supabase.from("inventory").insert([
      { product_id: productId, quantity: targetQty },
    ]);
    updateErr = error;
  }

  if (updateErr) return { error: updateErr.message };

  // 3. Record stock movement
  const { data: session } = await supabase.auth.getSession();
  await supabase.from("stock_movements").insert([
    {
      product_id: productId,
      movement_type: movementType,
      previous_stock: prevStock,
      new_stock: targetQty,
      admin_id: session?.session?.user?.id || null,
    },
  ]);

  // 4. Record audit log
  await logAdminActivity("inventory_adjustment", {
    product_id: productId,
    previous_stock: prevStock,
    new_stock: targetQty,
    delta,
    movement_type: movementType,
    reason,
  });

  return { data: { previous_stock: prevStock, new_stock: targetQty }, error: null };
}

export async function getStockMovements(productId = null, limit = 50) {
  let query = supabase
    .from("stock_movements")
    .select(`
      id,
      product_id,
      movement_type,
      previous_stock,
      new_stock,
      admin_id,
      created_at,
      products ( id, name, sku )
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
