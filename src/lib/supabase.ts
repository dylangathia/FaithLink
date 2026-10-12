import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Placeholder values keep the client constructible so the app can show setup instructions
export const supabase = createClient(url || "http://localhost:54321", anonKey || "not-configured", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
