import type {
  CityWithParks,
  CountryWithChildren,
  ThemeParkWithRides,
} from "@twm/shared";

export function findCity(
  countries: CountryWithChildren[],
  cityId: number,
): { country: CountryWithChildren; city: CityWithParks } | null {
  for (const country of countries) {
    const city = country.cities.find((c) => c.id === cityId);
    if (city) return { country, city };
  }
  return null;
}

export function findPark(
  countries: CountryWithChildren[],
  parkId: number,
): {
  country: CountryWithChildren;
  city: CityWithParks;
  park: ThemeParkWithRides;
} | null {
  for (const country of countries) {
    for (const city of country.cities) {
      const park = city.themeParks.find((p) => p.id === parkId);
      if (park) return { country, city, park };
    }
  }
  return null;
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch] ?? ch,
  );
}

/** Stable string that changes whenever the map data (or its shape) changes. */
export function mapSignature(countries: CountryWithChildren[]): string {
  return countries
    .map(
      (c) =>
        `${c.isoA3}#${c.cities
          .map((city) => `${city.id}.${city.themeParks.length}`)
          .join("-")}`,
    )
    .sort()
    .join("|");
}
