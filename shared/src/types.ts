/**
 * Shared domain types for traveling-world-map.
 *
 * Hierarchy: Country -> City -> ThemePark -> Ride
 */

export interface Photo {
  url: string;
  caption?: string;
}

export type RideType = "coaster" | "flat";

export interface Ride {
  id: number;
  parkId: number;
  name: string;
  type: RideType;
  isFavourite: boolean;
  notes?: string;
}

export interface ThemePark {
  id: number;
  cityId: number;
  name: string;
  lat: number;
  lng: number;
  info?: string;
  visitedYear?: number;
  photos: Photo[];
}

export interface City {
  id: number;
  countryId: number;
  name: string;
  lat: number;
  lng: number;
  notes?: string;
  visitedYear?: number;
  photos: Photo[];
}

export interface Country {
  id: number;
  /** Display name. */
  name: string;
  /** ISO 3166-1 alpha-3 code; matches the ISO_A3 property in the world GeoJSON. */
  isoA3: string;
  notes?: string;
  visitedYear?: number;
  photos: Photo[];
}

/* Nested shapes returned by GET /api/map */

export interface ThemeParkWithRides extends ThemePark {
  rides: Ride[];
}

export interface CityWithParks extends City {
  themeParks: ThemeParkWithRides[];
}

export interface CountryWithChildren extends Country {
  cities: CityWithParks[];
}

/* GET /api/stats */

export interface Stats {
  countries: number;
  cities: number;
  themeParks: number;
  coasters: number;
}
