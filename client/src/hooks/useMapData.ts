import { useCallback, useEffect, useState } from "react";

import type { CountryWithChildren } from "@twm/shared";

import { api, ApiError } from "../api";

export interface MapData {
  countries: CountryWithChildren[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useMapData(): MapData {
  const [countries, setCountries] = useState<CountryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    api
      .getMap()
      .then((data) => {
        setCountries(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "failed to reach the API");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  return { countries, loading, error, reload };
}
