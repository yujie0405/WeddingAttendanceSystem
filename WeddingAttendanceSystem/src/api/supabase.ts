import { createClient } from "@supabase/supabase-js";
import { isApiMode, isAuthConfigured, supabaseUrl, supabasePublishableKey } from "../config";

// This client is used for authentication only. Wedding data goes through .NET.
export const supabase = isApiMode && isAuthConfigured()
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;
