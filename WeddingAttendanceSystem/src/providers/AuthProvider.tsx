import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CurrentUser } from "../types";
import { authKey, defaultUser, normalizeUser } from "../api/migrations";
interface Auth {
  user: CurrentUser | null;
  login: (name: string) => void;
  logout: () => void;
}
export const AuthContext = createContext<Auth | null>(null);
function loadUser() {
  try {
    const saved =
      localStorage.getItem(authKey) ??
      localStorage.getItem("wedding-template-v1:currentUser");
    return saved === null ? defaultUser : normalizeUser(JSON.parse(saved));
  } catch {
    return null;
  }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(loadUser);
  const update = (value: CurrentUser | null) => {
    localStorage.setItem(authKey, JSON.stringify(value));
    setUser(value);
  };
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === authKey) setUser(loadUser());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        login: (name) =>
          update({
            name: name.trim(),
            role: name.toLowerCase().includes("admin") ? "admin" : "staff",
          }),
        logout: () => update(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
