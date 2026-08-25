import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://yfgdljzqicapjtzatiyk.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_1fs-CnkmY9TeHi3rnM867A_vAOTiSQv";

// Create client-side Supabase instance
export const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL || SUPABASE_URL,
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);
