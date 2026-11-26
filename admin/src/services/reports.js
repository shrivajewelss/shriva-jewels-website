import { supabase } from "./supabase.js";
import { LOW_STOCK_THRESHOLD } from "./inventory.js";

/**
 * Calculates Dashboard overview statistics from real Supabase data.
 */
export async function getDashboardStats() {
  try {
    // 1. Fetch Orders
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("id, total_amount, payment_status, order_status, created_at, phone, email");

    // 2. Fetch Products
    const { data: products, error: prodsErr } = await supabase
      .from("products")
      .select("id, name, price, status");

    // 3. Fetch Inventory
    const { data: inventory, error: invErr } = await supabase
      .from("inventory")
      .select("product_id, quantity, low_stock_threshold");

    // 4. Fetch Stock Batches Items for Cost of Goods / Valuation
    const { data: batchItems } = await supabase
      .from("stock_batch_items")
      .select("product_id, quantity, remaining_quantity, purchase_cost");

    // 5. Fetch Expenses
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount, category, expense_date");

    const orderList = orders || [];
    const prodList = products || [];
    const invList = inventory || [];
    const expList = expenses || [];
    const bItemList = batchItems || [];

    // Revenue calculations (from valid non-cancelled orders)
    const validOrders = orderList.filter(
      (o) => String(o.order_status || "").toLowerCase() !== "cancelled"
    );
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const pendingOrders = orderList.filter(
      (o) => String(o.order_status || "").toLowerCase() === "pending"
    ).length;
    const confirmedOrders = orderList.filter(
      (o) => String(o.order_status || "").toLowerCase() === "confirmed"
    ).length;
    const deliveredOrders = orderList.filter(
      (o) => String(o.order_status || "").toLowerCase() === "delivered"
    ).length;

    // Unique customer count
    const uniqueCustomers = new Set(orderList.map((o) => o.phone || o.email).filter(Boolean)).size;

    // Inventory Valuation & Low stock count
    const lowStockCount = invList.filter(
      (i) => (i.quantity ?? 0) <= (i.low_stock_threshold ?? LOW_STOCK_THRESHOLD)
    ).length;

    // Calculate product cost map from batch items (weighted average or latest FIFO batch cost)
    const costMap = {};
    for (const b of bItemList) {
      if (!costMap[b.product_id] || b.remaining_quantity > 0) {
        costMap[b.product_id] = Number(b.purchase_cost) || 0;
      }
    }

    // Total Inventory Valuation (units in stock * purchase cost or fallback 50% of retail price)
    const inventoryValuation = invList.reduce((val, item) => {
      const prod = prodList.find((p) => p.id === item.product_id);
      const cost = costMap[item.product_id] || (prod ? Number(prod.price) * 0.5 : 0);
      return val + (item.quantity || 0) * cost;
    }, 0);

    // Total Expenses
    const totalExpenses = expList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Estimated COGS for valid orders
    // In strict FIFO: order items * batch purchase cost. Fallback: 50% COGS ratio
    const estimatedCOGS = validOrders.reduce((cogs, o) => cogs + (Number(o.total_amount) || 0) * 0.45, 0);
    const grossProfit = Math.max(0, totalRevenue - estimatedCOGS);
    const netProfit = grossProfit - totalExpenses;

    return {
      data: {
        total_revenue: totalRevenue,
        total_orders: orderList.length,
        pending_orders: pendingOrders,
        confirmed_orders: confirmedOrders,
        delivered_orders: deliveredOrders,
        total_customers: uniqueCustomers,
        total_products: prodList.length,
        low_stock_products: lowStockCount,
        inventory_valuation: Math.round(inventoryValuation),
        gross_profit: Math.round(grossProfit),
        net_profit: Math.round(netProfit),
        total_expenses: totalExpenses,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Fetch monthly and weekly revenue breakdowns for sales charts.
 */
export async function getRevenueTrends() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("total_amount, created_at, order_status")
    .neq("order_status", "cancelled")
    .order("created_at", { ascending: true });

  if (error) return { monthly: [], weekly: [] };

  const monthMap = {};
  const dayMap = {};

  (orders || []).forEach((o) => {
    const d = new Date(o.created_at);
    if (isNaN(d.getTime())) return;

    // Month key: YYYY-MM
    const mKey = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthMap[mKey] = (monthMap[mKey] || 0) + (Number(o.total_amount) || 0);

    // Day key: YYYY-MM-DD
    const dayKey = d.toISOString().split("T")[0];
    dayMap[dayKey] = (dayMap[dayKey] || 0) + (Number(o.total_amount) || 0);
  });

  const monthly = Object.entries(monthMap).map(([label, revenue]) => ({ label, revenue }));
  const weekly = Object.entries(dayMap).slice(-7).map(([label, revenue]) => ({ label, revenue }));

  return { monthly, weekly };
}
