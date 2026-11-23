import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function createCategory(catData) {
  const { data, error } = await supabase
    .from("categories")
    .insert([
      {
        name: catData.name,
        slug: catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: catData.description || "",
        image_url: catData.image_url || null,
        sort_order: Number(catData.sort_order) || 0,
        is_active: catData.is_active ?? true,
      },
    ])
    .select()
    .single();

  if (!error) {
    await logAdminActivity("create_category", { category_id: data.id, name: data.name });
  }

  return { data, error: error?.message };
}

export async function updateCategory(id, catData) {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: catData.name,
      slug: catData.slug,
      description: catData.description,
      image_url: catData.image_url,
      sort_order: Number(catData.sort_order),
      is_active: catData.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await logAdminActivity("update_category", { category_id: id, updates: catData });
  }

  return { data, error: error?.message };
}

export async function deleteCategory(id, name) {
  // Check if any product belongs to this category first
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return { error: `Cannot delete category: ${count} product(s) are currently assigned to it.` };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (!error) {
    await logAdminActivity("delete_category", { category_id: id, name });
  }
  return { error: error?.message };
}
