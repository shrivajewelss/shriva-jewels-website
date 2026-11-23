import { supabase } from "./supabase.js";

/**
 * Record an action to the existing audit_logs table.
 */
export async function logAdminActivity(action, details = {}) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData?.session?.user?.id;

    const { error } = await supabase.from("audit_logs").insert({
      admin_id: adminId || null,
      action,
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
