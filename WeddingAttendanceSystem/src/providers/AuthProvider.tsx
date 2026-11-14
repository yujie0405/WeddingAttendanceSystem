import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import type { CurrentUser } from "../types";
import { authKey, defaultUser, normalizeUser } from "../api/migrations";
import { apiRequest } from "../api/http";
import { supabase } from "../api/supabase";
import { isApiMode } from "../config";
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isApiMode && !!supabase);
  const [authError, setAuthError] = useState<TranslationKey>();
  const [retryCount, setRetryCount] = useState(0);
  const updateLocal = (value: CurrentUser | null) => {
    localStorage.setItem(authKey, JSON.stringify(value));
    setUser(value);
  };
  useEffect(() => {
    if (!isApiMode) {
      const sync = (event: StorageEvent) => { if (event.key === authKey) setUser(loadUser()); };
      window.addEventListener("storage", sync);
      return () => window.removeEventListener("storage", sync);
    }
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      // Keep this callback synchronous; resolve the backend identity in an effect.
      setSession(next);
      setLoading(!!next);
      setAuthError(undefined);
      if (!next) setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!isApiMode || !session) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    void apiRequest<CurrentUser>("/auth/me", { signal: controller.signal }, session.access_token)
      .then(value => { if (active) { setUser(value); setAuthError(undefined); } })
      .catch(error => {
        if (active) { setUser(null); setAuthError(error instanceof AppError ? error.key : "Backend.RequestFailed"); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [session, retryCount]);
  return (
    <AuthContext.Provider value={{
      user, loading, authError,
      retry: () => setRetryCount(value => value + 1),
      login: async (name, password = "") => {
        if (!isApiMode) {
          updateLocal({ name: name.trim(), role: name.toLowerCase().includes("admin") ? "admin" : "staff" });
          return;
        }
        if (!supabase) throw new AppError("Backend.ConfigurationRequired");
        const { error } = await supabase.auth.signInWithPassword({ email: name.trim(), password });
        if (error) throw new AppError("Backend.LoginFailed");
      },
      logout: async () => {
        if (!isApiMode) { updateLocal(null); return; }
        if (supabase) {
          const { error } = await supabase.auth.signOut({ scope: "local" });
          if (error) throw new AppError("Backend.RequestFailed");
        }
        setSession(null);
        setUser(null);
        setLoading(false);
        setAuthError(undefined);
      },
    }}>{children}</AuthContext.Provider>
  );
}
