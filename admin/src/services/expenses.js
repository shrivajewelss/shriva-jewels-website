import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export const EXPENSE_CATEGORIES = [
  { value: "packaging", label: "Packaging" },
  { value: "postage", label: "Postage" },
  { value: "shipping", label: "Shipping" },
  { value: "marketing", label: "Marketing / Ads" },
  { value: "operational", label: "Operational" },
  { value: "other", label: "Other" },
];

export async function getExpenses({ category = "", startDate = "", endDate = "" } = {}) {
  let query = supabase
    .from("expenses")
    .select(`
      id,
      category,
      amount,
      expense_date,
      description,
      order_id,
      product_id,
      created_at,
      admin_profiles ( full_name )
    `)
    .order("expense_date", { ascending: false });

  if (category) query = query.eq("category", category);
  if (startDate) query = query.gte("expense_date", startDate);
  if (endDate) query = query.lte("expense_date", endDate);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };

  return {
    data: (data || []).map((e) => ({
      ...e,
      amount: Number(e.amount) || 0,
    })),
    error: null,
  };
}

export async function createExpense(expenseData) {
  const { data: session } = await supabase.auth.getSession();
  const adminId = session?.session?.user?.id || null;

  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        category: expenseData.category,
        amount: Number(expenseData.amount) || 0,
        expense_date: expenseData.expense_date || new Date().toISOString().split("T")[0],
        description: expenseData.description || "",
        order_id: expenseData.order_id || null,
        product_id: expenseData.product_id || null,
        created_by: adminId,
      },
    ])
    .select()
    .single();

  if (!error) {
    await logAdminActivity("create_expense", {
      expense_id: data.id,
      category: data.category,
      amount: data.amount,
    });
  }

  return { data, error: error?.message };
}

export async function updateExpense(id, expenseData) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      category: expenseData.category,
      amount: Number(expenseData.amount),
      expense_date: expenseData.expense_date,
      description: expenseData.description,
      order_id: expenseData.order_id || null,
      product_id: expenseData.product_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await logAdminActivity("update_expense", { expense_id: id, updates: expenseData });
  }

  return { data, error: error?.message };
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (!error) {
    await logAdminActivity("delete_expense", { expense_id: id });
  }
  return { error: error?.message };
}
