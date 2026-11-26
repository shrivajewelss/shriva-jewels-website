import { supabase } from "./supabase.js";

/**
 * Sign in admin using Supabase Auth and verify against active admin_profiles record.
 */
export async function signInAdmin({ email, password }) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { user: null, profile: null, error: authError.message };
    }

    const user = authData.user;
    if (!user) {
      return { user: null, profile: null, error: "Authentication failed. No user returned." };
    }

    // Verify user ID against admin_profiles table
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, full_name, is_active, created_at, updated_at")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        user: null,
        profile: null,
        error: "Access Denied: Your account does not have an authorized administrator profile.",
      };
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      return {
        user: null,
        profile: null,
        error: "Access Denied: Your administrator account is currently inactive.",
      };
    }

    // Log admin login to audit_logs
    try {
      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action: "admin_login",
        entity_type: "admin_profile",
        entity_id: user.id,
        details: { email: user.email, timestamp: new Date().toISOString() },
      });
    } catch {
      // Non-blocking for login flow
    }

    return { user, profile, error: null };
  } catch (err) {
    return { user: null, profile: null, error: err.message || "An unexpected error occurred." };
  }
}

/**
 * Log out current admin.
 */
export async function signOutAdmin() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Sign out error:", e);
  }
}

/**
 * Verify current active admin session.
 */
export async function getAuthenticatedAdmin() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session?.user) {
      return { user: null, profile: null };
    }

    const { data: profile, error } = await supabase
      .from("admin_profiles")
      .select("id, full_name, is_active, created_at, updated_at")
      .eq("id", session.user.id)
      .single();

    if (error || !profile || !profile.is_active) {
      return { user: null, profile: null };
    }

    return { user: session.user, profile };
  } catch {
    return { user: null, profile: null };
  }
}

/**
 * Send password reset email.
 */
export async function requestPasswordReset(email) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

/**
 * Update password for current logged-in or recovering user.
 */
export async function updateAdminPassword(newPassword) {
  return await supabase.auth.updateUser({ password: newPassword });
}

/**
 * Fetch all rows from public.admin_profiles.
 */
export async function getAdminProfiles() {
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id, full_name, is_active, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}
