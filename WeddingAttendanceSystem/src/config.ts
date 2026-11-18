export const isApiMode = import.meta.env.VITE_DATA_SOURCE !== "local";
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5247/api").replace(/\/+$/, "");

export function isAuthConfigured() {
  try {
    return ["https:", "http:"].includes(new URL(apiBaseUrl).protocol);
  } catch {
    return false;
  }
}
