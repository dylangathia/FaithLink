import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** True until the session is known and, if signed in, the profile has loaded. */
  loading: boolean;
  updateProfile: (fields: Partial<Pick<Profile, "full_name">>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(!isSupabaseConfigured);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoadedFor, setProfileLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  // On every sign-in: join any church that invited this email/phone, then load the profile
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileLoadedFor(null);
      return;
    }
    let cancelled = false;
    (async () => {
      await supabase.rpc("claim_invitations");
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (cancelled) return;
      setProfile(data as Profile | null);
      setProfileLoadedFor(userId);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateProfile = useCallback(
    async (fields: Partial<Pick<Profile, "full_name">>) => {
      if (!userId) return;
      // Upsert so an account that somehow has no profile row still gets one
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...fields }, { onConflict: "id" })
        .select()
        .single();
      if (error) throw error;
      setProfile(data as Profile);
    },
    [userId],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const loading = !sessionLoaded || (!!userId && profileLoadedFor !== userId);

  return (
    <AuthContext.Provider value={{ session, profile, loading, updateProfile, signOut }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
