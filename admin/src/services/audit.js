import { supabase } from "./supabase.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveAuditEntity(action, details = {}, options = {}) {
  let entityType = options.entityType || details?.entity_type || "";
  if (!entityType) {
    if (action.includes("category")) entityType = "category";
    else if (action.includes("product")) entityType = "product";
    else if (action.includes("inventory") || action.includes("stock")) entityType = "inventory";
    else if (action.includes("order") || action.includes("payment")) entityType = "order";
    else if (action.includes("batch")) entityType = "stock_batch";
    else if (action.includes("expense")) entityType = "expense";
    else if (action.includes("offer")) entityType = "offer";
    else if (action.includes("customer")) entityType = "customer_note";
    else if (action.includes("login") || action.includes("admin")) entityType = "admin_profile";
    else entityType = "system";
  }

  const rawId =
    options.entityId ??
    details?.entity_id ??
    details?.product_id ??
    details?.category_id ??
    details?.order_id ??
    details?.batch_id ??
    details?.expense_id ??
    details?.offer_id ??
    null;

  const entityId = typeof rawId === "string" && UUID_REGEX.test(rawId) ? rawId : null;
  return { entityType, entityId };
}

/**
 * Record an action to the audit_logs table matching Supabase NOT NULL constraints.
 */
export async function logAdminActivity(action, details = {}, options = {}) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData?.session?.user?.id;
    const { entityType, entityId } = resolveAuditEntity(action, details, options);

    const { error } = await supabase.from("audit_logs").insert({
      admin_id: adminId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });

    if (error) {
      console.warn("Audit logging warning:", error.message);
    }
  } catch (e) {
    console.warn("Failed to write audit log:", e);
  }
}

/**
 * Fetch recent audit logs.
 */
export async function getAuditLogs(limit = 50) {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        id,
        admin_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at,
        admin_profiles ( id, full_name )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}
