import { useEffect, useState } from "react";
import type { FeatureCollection, Geometry } from "geojson";

import type { CountryFeatureProps } from "../components/Map/CountriesLayer";

export interface CatalogEntry {
  name: string;
  code: string;
}

/** The full list of countries from the world GeoJSON, sorted by name. */
export function useCountryCatalog(): CatalogEntry[] {
  const [list, setList] = useState<CatalogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/countries.geo.json")
      .then((res) => res.json())
      .then((fc: FeatureCollection<Geometry, CountryFeatureProps>) => {
        if (cancelled) return;
        const entries = fc.features
          .map((f) => ({ name: f.properties.name, code: f.properties.code }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setList(entries);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return list;
}
