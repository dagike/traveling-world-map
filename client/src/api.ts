import type {
  City,
  Country,
  CountryWithChildren,
  PlaceStatus,
  Ride,
  RideType,
  Stats,
  ThemePark,
} from "@twm/shared";

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
  status?: PlaceStatus;
}

export interface NewCity {
  name: string;
  lat: number;
  lng: number;
  visitedYear?: number;
  status?: PlaceStatus;
}

export interface NewThemePark {
  name: string;
  lat: number;
  lng: number;
  info?: string;
  visitedYear?: number;
  status?: PlaceStatus;
}

export interface NewRide {
  name: string;
  type: RideType;
  isFavourite?: boolean;
  notes?: string;
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
  createThemePark: (cityId: number, input: NewThemePark) =>
    request<ThemePark>(`/cities/${cityId}/theme-parks`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  createRide: (parkId: number, input: NewRide) =>
    request<Ride>(`/theme-parks/${parkId}/rides`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateCountry: (
    id: number,
    patch: {
      name?: string;
      visitedYear?: number | null;
      notes?: string | null;
      status?: PlaceStatus;
    },
  ) => request<Country>(`/countries/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  updateCity: (
    id: number,
    patch: {
      name?: string;
      lat?: number;
      lng?: number;
      visitedYear?: number | null;
      notes?: string | null;
      status?: PlaceStatus;
    },
  ) => request<City>(`/cities/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  updateThemePark: (
    id: number,
    patch: {
      name?: string;
      lat?: number;
      lng?: number;
      info?: string | null;
      visitedYear?: number | null;
      status?: PlaceStatus;
    },
  ) =>
    request<ThemePark>(`/theme-parks/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  updateRide: (rideId: number, patch: Partial<NewRide>) =>
    request<Ride>(`/rides/${rideId}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),
  deleteCountry: (id: number) =>
    request<void>(`/countries/${id}`, { method: "DELETE" }),
  deleteCity: (id: number) => request<void>(`/cities/${id}`, { method: "DELETE" }),
  deleteThemePark: (id: number) =>
    request<void>(`/theme-parks/${id}`, { method: "DELETE" }),
  deleteRide: (id: number) => request<void>(`/rides/${id}`, { method: "DELETE" }),
  login: async (password: string): Promise<void> => {
    const { token: newToken } = await request<{ token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setToken(newToken);
  },
  logout: () => setToken(null),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/admin/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
