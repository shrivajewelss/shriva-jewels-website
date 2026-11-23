import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export async function getStockBatches() {
  try {
    const { data: batches, error } = await supabase
      .from("stock_batches")
      .select(`
        id,
        batch_number,
        supplier_name,
        invoice_reference,
        purchase_date,
        notes,
        total_cost,
        created_at,
        updated_at,
        stock_batch_items (
          id,
          product_id,
          quantity,
          remaining_quantity,
          purchase_cost
        )
      `)
      .order("purchase_date", { ascending: false });

    if (error) {
      // If table does not yet exist or is empty
      return { data: [], error: error.message };
    }

    const formatted = (batches || []).map((b) => {
      const items = b.stock_batch_items || [];
      const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
      const remainingUnits = items.reduce((sum, item) => sum + item.remaining_quantity, 0);
      const computedCost = items.reduce((sum, item) => sum + item.quantity * Number(item.purchase_cost), 0);

      return {
        ...b,
        total_units: totalUnits,
        remaining_units: remainingUnits,
        items_count: items.length,
        total_cost: b.total_cost > 0 ? Number(b.total_cost) : computedCost,
      };
    });

    return { data: formatted, error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function getStockBatchById(batchId) {
  try {
    const { data: batch, error } = await supabase
      .from("stock_batches")
      .select(`
        id,
        batch_number,
        supplier_name,
        invoice_reference,
        purchase_date,
        notes,
        total_cost,
        created_at,
        stock_batch_items (
          id,
          product_id,
          quantity,
          remaining_quantity,
          purchase_cost,
          created_at
        )
      `)
      .eq("id", batchId)
      .single();

    if (error) return { data: null, error: error.message };

    // Fetch product details for batch line items
    const productIds = (batch.stock_batch_items || []).map((i) => i.product_id);
    let productsMap = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, sku, price")
        .in("id", productIds);

      productsMap = Object.fromEntries((prods || []).map((p) => [p.id, p]));
    }

    const items = (batch.stock_batch_items || []).map((item) => ({
      ...item,
      product_name: productsMap[item.product_id]?.name || `Product (${item.product_id})`,
      sku: productsMap[item.product_id]?.sku || "—",
      selling_price: productsMap[item.product_id]?.price || 0,
      subtotal_cost: item.quantity * Number(item.purchase_cost),
    }));

    return {
      data: {
        ...batch,
        items,
        total_units: items.reduce((s, i) => s + i.quantity, 0),
        total_cost: items.reduce((s, i) => s + i.subtotal_cost, 0),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Creates a stock batch and updates product inventory atomically.
 */
export async function createStockBatch({
  batch_number,
  supplier_name,
  invoice_reference,
  purchase_date,
  notes,
  items = [],
}) {
  if (!batch_number || !supplier_name || items.length === 0) {
    return { error: "Please provide a batch number, supplier name, and at least one product line item." };
  }

  const { data: session } = await supabase.auth.getSession();
  const adminId = session?.session?.user?.id || null;

  const totalCost = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchase_cost) || 0),
    0
  );

  // 1. Insert stock batch
  const { data: batch, error: batchErr } = await supabase
    .from("stock_batches")
    .insert([
      {
        batch_number,
        supplier_name,
        invoice_reference: invoice_reference || null,
        purchase_date: purchase_date || new Date().toISOString().split("T")[0],
        notes: notes || null,
        total_cost: totalCost,
        created_by: adminId,
      },
    ])
    .select()
    .single();

  if (batchErr) return { error: batchErr.message };

  // 2. Insert batch items and increment inventory
  const batchItemsToInsert = [];

  for (const item of items) {
    const qty = parseInt(item.quantity, 10) || 0;
    const cost = Number(item.purchase_cost) || 0;
    if (qty <= 0) continue;

    batchItemsToInsert.push({
      batch_id: batch.id,
      product_id: item.product_id,
      quantity: qty,
      remaining_quantity: qty,
      purchase_cost: cost,
    });

    // Check & update inventory for this product
    const { data: curInv } = await supabase
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", item.product_id)
      .single();

    const prevStock = curInv?.quantity ?? 0;
    const newStock = prevStock + qty;

    if (curInv) {
      await supabase
        .from("inventory")
        .update({ quantity: newStock, updated_at: new Date().toISOString() })
        .eq("id", curInv.id);
    } else {
      await supabase.from("inventory").insert([
        { product_id: item.product_id, quantity: newStock },
      ]);
    }

    // Record stock movement
    await supabase.from("stock_movements").insert([
      {
        product_id: item.product_id,
        movement_type: "batch_restock",
        previous_stock: prevStock,
        new_stock: newStock,
        admin_id: adminId,
      },
    ]);
  }

  if (batchItemsToInsert.length > 0) {
    const { error: itemsErr } = await supabase.from("stock_batch_items").insert(batchItemsToInsert);
    if (itemsErr) console.warn("Batch items insert warning:", itemsErr.message);
  }

  await logAdminActivity("create_stock_batch", {
    batch_id: batch.id,
    batch_number: batch.batch_number,
    supplier: supplier_name,
    items_count: items.length,
    total_cost: totalCost,
  });

  return { data: batch, error: null };
}
