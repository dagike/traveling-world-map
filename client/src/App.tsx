import { useEffect, useState } from "react";

import type { Stats } from "@twm/shared";

import { api, ApiError } from "./api";

export function App() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "failed to reach the API");
      });
  }, []);

  return (
    <main style={{ padding: "2rem", maxWidth: 640 }}>
      <h1>traveling world map</h1>
      <p>Client scaffold. The interactive map is built in the next steps.</p>
      {error && <p style={{ color: "crimson" }}>API error: {error}</p>}
      {stats && (
        <ul>
          <li>{stats.countries} countries</li>
          <li>{stats.cities} cities</li>
          <li>{stats.themeParks} theme parks</li>
          <li>{stats.coasters} coasters</li>
        </ul>
      )}
    </main>
  );
}
