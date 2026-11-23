import { supabase } from "./supabase.js";
import { logAdminActivity } from "./audit.js";

export async function getOffers() {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function createOffer(offerData) {
  const code = (offerData.code || "").toUpperCase().trim();
  const { data, error } = await supabase
    .from("offers")
    .insert([
      {
        code,
        title: offerData.title,
        description: offerData.description || "",
        discount_type: offerData.discount_type || "percentage",
        discount_value: Number(offerData.discount_value) || 0,
        min_order_amount: Number(offerData.min_order_amount) || 0,
        max_discount_amount: offerData.max_discount_amount ? Number(offerData.max_discount_amount) : null,
        start_date: offerData.start_date || new Date().toISOString(),
        end_date: offerData.end_date || null,
        is_active: offerData.is_active ?? true,
        usage_limit: offerData.usage_limit ? parseInt(offerData.usage_limit, 10) : null,
      },
    ])
    .select()
    .single();

  if (!error) {
    await logAdminActivity("create_offer", { offer_id: data.id, code: data.code });
  }

  return { data, error: error?.message };
}

export async function updateOffer(id, offerData) {
  const { data, error } = await supabase
    .from("offers")
    .update({
      code: (offerData.code || "").toUpperCase().trim(),
      title: offerData.title,
      description: offerData.description,
      discount_type: offerData.discount_type,
      discount_value: Number(offerData.discount_value),
      min_order_amount: Number(offerData.min_order_amount),
      max_discount_amount: offerData.max_discount_amount ? Number(offerData.max_discount_amount) : null,
      start_date: offerData.start_date,
      end_date: offerData.end_date || null,
      is_active: offerData.is_active,
      usage_limit: offerData.usage_limit ? parseInt(offerData.usage_limit, 10) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await logAdminActivity("update_offer", { offer_id: id, updates: offerData });
  }

  return { data, error: error?.message };
}

export async function toggleOfferStatus(id, currentStatus) {
  const newStatus = !currentStatus;
  const { data, error } = await supabase
    .from("offers")
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (!error) {
    await logAdminActivity("toggle_offer_status", { offer_id: id, is_active: newStatus });
  }

  return { data, error: error?.message };
}
