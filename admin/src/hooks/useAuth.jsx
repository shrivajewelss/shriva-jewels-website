import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase.js";
import { signInAdmin, signOutAdmin, getAuthenticatedAdmin } from "../services/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    const { user: authUser, profile: adminProfile } = await getAuthenticatedAdmin();
    setUser(authUser);
    setProfile(adminProfile);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          const { data: p } = await supabase
            .from("admin_profiles")
            .select("id, full_name, is_active, created_at, updated_at")
            .eq("id", session.user.id)
            .single();

          if (p && p.is_active) {
            setUser(session.user);
            setProfile(p);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    const res = await signInAdmin(credentials);
    if (!res.error) {
      setUser(res.user);
      setProfile(res.profile);
    }
    return res;
  };

  const logout = async () => {
    await signOutAdmin();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: Boolean(user && profile?.is_active),
    login,
    logout,
    refreshProfile: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
