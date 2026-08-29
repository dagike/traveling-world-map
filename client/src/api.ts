import type { City, Country, CountryWithChildren, Stats } from "@twm/shared";

const BASE = "/api";
const TOKEN_KEY = "twm.adminToken";

let token: string | null =
  typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export function getToken(): string | null {
  return token;
}

export function setToken(value: string | null): void {
  token = value;
  if (typeof localStorage === "undefined") return;
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const data = res.headers.get("content-type")?.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : `request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export interface NewCountry {
  name: string;
  isoA3: string;
  visitedYear?: number;
}

export interface NewCity {
  name: string;
  lat: number;
  lng: number;
  visitedYear?: number;
}

export const api = {
  getMap: () => request<CountryWithChildren[]>("/map"),
  getStats: () => request<Stats>("/stats"),
  createCountry: (input: NewCountry) =>
    request<Country>("/countries", { method: "POST", body: JSON.stringify(input) }),
  createCity: (countryId: number, input: NewCity) =>
    request<City>(`/countries/${countryId}/cities`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  login: async (password: string): Promise<void> => {
    const { token: newToken } = await request<{ token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setToken(newToken);
  },
  logout: () => setToken(null),
};
