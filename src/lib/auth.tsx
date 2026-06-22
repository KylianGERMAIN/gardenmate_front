"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getAccess,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  type User,
} from "./api";

const USER_KEY = "gm_user";

/* ── Store externe : la session vit dans localStorage ──────────
 * useSyncExternalStore lit ce store sans effet ni setState (donc sans render
 * en cascade) et, via getServerSnapshot, rend `null` au render serveur ET au
 * 1er render client → pas de hydration mismatch.
 */

// Snapshot mémoïsé : getSnapshot doit renvoyer une référence STABLE tant que
// rien n'a changé, sinon useSyncExternalStore boucle en re-render. On ne
// recrée l'objet User que si la string brute du localStorage a changé.
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

function getSnapshot(): User | null {
  // Pas de token = pas de session (cohérent avec apiFetch).
  if (!getAccess()) {
    cachedRaw = null;
    cachedUser = null;
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as User) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

// Serveur + 1er render client : localStorage indisponible → null.
function getServerSnapshot(): null {
  return null;
}

const listeners = new Set<() => void>();

function emitChange(): void {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Cross-tab : l'event natif `storage` ne fire que sur les AUTRES onglets.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Détecteur d'hydratation sans effet : false au serveur + 1er render client,
// true après hydratation. Évite de rediriger un user connecté pendant que le
// vrai snapshot n'est pas encore lu.
const noopSubscribe = () => () => {};

/* ── Provider / hook ───────────────────────────────────────── */

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // login/register/logout mutent localStorage : on notifie les listeners du
  // même onglet (l'event `storage` ne s'y déclenche pas).
  const persist = (u: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    emitChange();
  };

  const value: AuthContextValue = {
    user,
    ready,
    login: async (email, password) => persist(await apiLogin(email, password)),
    register: async (email, password) => persist(await apiRegister(email, password)),
    logout: async () => {
      await apiLogout();
      localStorage.removeItem(USER_KEY);
      emitChange();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
