import { createClient } from "@supabase/supabase-js";

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  if (!envUrl || !envKey) return false;
  if (envUrl.includes("placeholder.supabase.co") || envUrl.includes("your-project-id") || envUrl.includes("yfgdljzqicapjtzatiyk.supabase.co")) return false;
  if (envKey.includes("placeholder_key") || envKey.includes("your-supabase-public-anon-key")) return false;
  return true;
};

export const SUPABASE_URL = isSupabaseConfigured() ? envUrl : "https://placeholder.supabase.co";
export const SUPABASE_ANON_KEY = isSupabaseConfigured() ? envKey : "placeholder_key";

// Create client-side Supabase instance
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);
