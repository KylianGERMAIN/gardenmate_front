/**
 * Client API GardenMate.
 *
 * Gère l'access token (court) + le refresh token (rotation). Sur 401, tente un
 * refresh une fois puis rejoue la requête. Les tokens sont stockés en
 * localStorage — choix pragmatique pour un SPA (l'API n'expose pas de cookie
 * httpOnly) ; à durcir si auth sensible.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://gardenmate-api.onrender.com/api/v1";

const ACCESS_KEY = "gm_access";
const REFRESH_KEY = "gm_refresh";

export type User = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  latitude: number | null;
  longitude: number | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type SunlightLevel = "FULL_SUN" | "PARTIAL_SHADE" | "SHADE";

export type Plant = {
  id: string;
  name: string;
  sunlightLevel: SunlightLevel;
  wateringFrequency: number | null;
};

export type CareStatus = "OVERDUE" | "SOON" | "OK" | "NO_SCHEDULE";

export type CareRecommendation = {
  userPlantId: string;
  plantId: string;
  plantName: string;
  status: CareStatus;
  nextWateringDate: string | null;
  adjustedIntervalDays: number | null;
  factors: { demand: number; exposure: number; source: "weather" | "season" };
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/* ── Token store (client-only) ───────────────────────────── */

export function getAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

function getRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/* ── Refresh (rotation) ──────────────────────────────────── */

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefresh();
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  // Rotation : on stocke la NOUVELLE paire (l'ancien refresh est révoqué).
  const data = (await res.json()) as AuthResponse;
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

/* ── Requête authentifiée ────────────────────────────────── */

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const access = getAccess();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && retry && getRefresh()) {
    if (await tryRefresh()) return apiFetch<T>(path, init, false);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(res.status, body.message ?? `Erreur ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ── Auth ────────────────────────────────────────────────── */

async function authRequest(path: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<AuthResponse> & { message?: string };
  if (!res.ok || !data.accessToken || !data.refreshToken || !data.user) {
    throw new ApiError(res.status, data.message ?? "Identifiants invalides");
  }

  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export function login(email: string, password: string): Promise<User> {
  return authRequest("/auth/login", email, password);
}

export function register(email: string, password: string): Promise<User> {
  return authRequest("/auth/register", email, password);
}

/* ── Jardin / care-plan ──────────────────────────────────── */

export function getCarePlan(userId: string): Promise<CareRecommendation[]> {
  return apiFetch<CareRecommendation[]>(`/users/${userId}/plants/care-plan`);
}

export function waterAll(userId: string): Promise<unknown> {
  return apiFetch(`/users/${userId}/plants/water-all`, { method: "POST" });
}

/* ── Catalogue ───────────────────────────────────────────── */

type Paginated<T> = { items: T[] };

// ponytail: on ne renvoie que les items (20 premiers), pagination ajoutée si le catalogue grossit
export async function getPlants(name?: string): Promise<Plant[]> {
  const q = name ? `?name=${encodeURIComponent(name)}` : "";
  const { items } = await apiFetch<Paginated<Plant>>(`/plants${q}`);
  return items;
}

export function addPlant(userId: string, plantId: string): Promise<unknown> {
  return apiFetch(`/users/${userId}/plants`, {
    method: "POST",
    body: JSON.stringify({ plantId }),
  });
}

// Pas d'endpoint d'arrosage unitaire côté API : on PATCH lastWateredAt = maintenant.
export function waterPlant(userId: string, userPlantId: string): Promise<unknown> {
  return apiFetch(`/users/${userId}/plants/${userPlantId}`, {
    method: "PATCH",
    body: JSON.stringify({ lastWateredAt: new Date().toISOString() }),
  });
}

export function removePlant(userId: string, userPlantId: string): Promise<unknown> {
  return apiFetch(`/users/${userId}/plants/${userPlantId}`, { method: "DELETE" });
}

export async function logout(): Promise<void> {
  const refreshToken = getRefresh();
  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearTokens();
}
