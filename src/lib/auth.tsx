"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getAccess,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type User,
} from "./api";

const USER_KEY = "gm_user";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Restaure la session au chargement (token + user persistés).
  useEffect(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (getAccess() && raw) {
      try {
        setUser(JSON.parse(raw) as User);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setReady(true);
  }, []);

  const persist = (u: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const value: AuthContextValue = {
    user,
    ready,
    login: async (email, password) => persist(await apiLogin(email, password)),
    register: async (email, password) => persist(await apiRegister(email, password)),
    logout: async () => {
      await apiLogout();
      localStorage.removeItem(USER_KEY);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
