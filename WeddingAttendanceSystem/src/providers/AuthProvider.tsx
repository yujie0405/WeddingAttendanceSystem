import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CurrentUser } from "../types";
import { authKey, defaultUser, normalizeUser } from "../api/migrations";
import { apiRequest } from "../api/http";
import { getAccessToken, setAccessToken } from "../api/session";
import { apiBaseUrl, isApiMode } from "../config";
import { AppError } from "../i18n/messages";
import type { TranslationKey } from "../i18n/messages";

interface Auth {
  user: CurrentUser | null;
  loading: boolean;
  authError?: TranslationKey;
  retry: () => void;
  login: (name: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}
export const AuthContext = createContext<Auth | null>(null);
function loadUser() {
  if (isApiMode) return null;
  try {
    const saved = localStorage.getItem(authKey) ?? localStorage.getItem("wedding-template-v1:currentUser");
    return saved === null ? defaultUser : normalizeUser(JSON.parse(saved));
  } catch { return null; }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(loadUser);
  const [token, setToken] = useState(() => isApiMode ? getAccessToken() : null);
  const [loading, setLoading] = useState(isApiMode && !!token);
  const [authError, setAuthError] = useState<TranslationKey>();
  const [retryCount, setRetryCount] = useState(0);
  const updateLocal = (value: CurrentUser | null) => {
    localStorage.setItem(authKey, JSON.stringify(value));
    setUser(value);
  };
  useEffect(() => {
    if (isApiMode) return;
    const sync = (event: StorageEvent) => { if (event.key === authKey) setUser(loadUser()); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!isApiMode || !token) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    void apiRequest<CurrentUser>("/auth/me", { signal: controller.signal }, token)
      .then(value => { if (active) { setUser(value); setAuthError(undefined); } })
      .catch(error => {
        if (active) { setUser(null); setAuthError(error instanceof AppError ? error.key : "Backend.RequestFailed"); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [token, retryCount]);
  return <AuthContext.Provider value={{
    user, loading, authError,
    retry: () => setRetryCount(value => value + 1),
    login: async (name, password = "") => {
      if (!isApiMode) {
        updateLocal({ name: name.trim(), role: name.toLowerCase().includes("admin") ? "admin" : "staff" });
        return;
      }
      let response: Response;
      try {
        response = await fetch(apiBaseUrl + "/auth/login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: name.trim(), password }),
        });
      } catch { throw new AppError("Backend.NetworkError"); }
      if (!response.ok) throw new AppError(response.status === 401 ? "Backend.LoginFailed" : response.status === 429 ? "Register.RateLimited" : "Backend.RequestFailed");
      const session = await response.json() as { accessToken: string };
      setAccessToken(session.accessToken);
      setAuthError(undefined);
      setLoading(true);
      setToken(session.accessToken);
    },
    logout: async () => {
      if (!isApiMode) { updateLocal(null); return; }
      setAccessToken(null);
      setToken(null);
      setUser(null);
      setLoading(false);
      setAuthError(undefined);
    },
  }}>{children}</AuthContext.Provider>;
}
