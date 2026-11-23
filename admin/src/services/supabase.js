import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://uyskfaqrptwpnxzgisnn.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseAnonKey) {
  console.warn("Supabase Anon Key is missing. Ensure VITE_SUPABASE_ANON_KEY is provided in .env.");
}

export const isSupabaseConfigured = Boolean(supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
