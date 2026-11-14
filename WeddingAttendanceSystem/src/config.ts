export const isApiMode = import.meta.env.VITE_DATA_SOURCE !== "local";
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5247/api").replace(/\/+$/, "");
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
export const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || "";

export function isAuthConfigured() {
  try {
    return ["https:", "http:"].includes(new URL(supabaseUrl).protocol) && !!supabasePublishableKey;
  } catch {
    return false;
  }
}
