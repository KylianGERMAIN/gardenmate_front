import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, login, getAccess, ApiError } from "./api";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function authHeader(init?: RequestInit): string | undefined {
  return (init?.headers as Record<string, string> | undefined)?.Authorization;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("api", () => {
  it("login stores both tokens and returns the user", async () => {
    const user = { id: "u1", email: "a@b.c", role: "USER", latitude: null, longitude: null };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { accessToken: "acc", refreshToken: "ref", user })),
    );

    const result = await login("a@b.c", "pw");

    expect(result).toEqual(user);
    expect(getAccess()).toBe("acc");
    expect(localStorage.getItem("gm_refresh")).toBe("ref");
  });

  it("retries once after a 401 by refreshing the token", async () => {
    localStorage.setItem("gm_access", "old");
    localStorage.setItem("gm_refresh", "refresh-1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/auth/refresh"))
          return jsonResponse(200, { accessToken: "new", refreshToken: "refresh-2", user: {} });
        return authHeader(init) === "Bearer old"
          ? jsonResponse(401, { message: "expired" })
          : jsonResponse(200, { data: "ok" });
      }),
    );

    const res = await apiFetch<{ data: string }>("/protected");

    expect(res).toEqual({ data: "ok" });
    expect(getAccess()).toBe("new");
  });

  it("dedupes concurrent refreshes (single-flight)", async () => {
    localStorage.setItem("gm_access", "old");
    localStorage.setItem("gm_refresh", "refresh-1");
    let refreshCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/auth/refresh")) {
          refreshCalls += 1;
          return jsonResponse(200, { accessToken: "new", refreshToken: "refresh-2", user: {} });
        }
        return authHeader(init) === "Bearer old"
          ? jsonResponse(401, { message: "expired" })
          : jsonResponse(200, { ok: true });
      }),
    );

    // Trois requêtes tombent en 401 en même temps → un seul refresh attendu.
    await Promise.all([apiFetch("/a"), apiFetch("/b"), apiFetch("/c")]);

    expect(refreshCalls).toBe(1);
  });

  it("throws ApiError on a non-ok response without a refresh token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(500, { message: "boom" })),
    );

    await expect(apiFetch("/x")).rejects.toBeInstanceOf(ApiError);
  });
});
