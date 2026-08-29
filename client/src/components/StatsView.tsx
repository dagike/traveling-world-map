import { useEffect, useState } from "react";

import type { CountryWithChildren, Stats } from "@twm/shared";

import { api, ApiError } from "../api";
import "./panels/panel.css";

interface Props {
  countries: CountryWithChildren[];
  onClose: () => void;
}

export function StatsView({ countries, onClose }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : "failed to load stats"),
      );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const parks = countries.flatMap((c) =>
    c.cities.flatMap((city) =>
      city.themeParks.map((p) => ({ park: p, city: city.name, country: c.name })),
    ),
  );
  const favCoasters = parks
    .map(({ park, city }) => {
      const fav = park.rides.find((r) => r.isFavourite && r.type === "coaster");
      return fav ? { name: fav.name, park: park.name, city } : null;
    })
    .filter((x): x is { name: string; park: string; city: string } => x !== null);

  return (
    <aside className="stats-panel">
      <button
        type="button"
        className="detail-panel__close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className="detail-panel__body">
        <h2>Totals</h2>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="n">{stats?.countries ?? "–"}</div>
            <div className="label">countries</div>
          </div>
          <div className="stat-card">
            <div className="n">{stats?.cities ?? "–"}</div>
            <div className="label">cities</div>
          </div>
          <div className="stat-card">
            <div className="n">{stats?.themeParks ?? "–"}</div>
            <div className="label">theme parks</div>
          </div>
          <div className="stat-card">
            <div className="n">{stats?.coasters ?? "–"}</div>
            <div className="label">coasters</div>
          </div>
        </div>

        <h3>Countries</h3>
        <ul className="plain">
          {countries.map((c) => (
            <li key={c.isoA3}>
              {c.name}
              <span className="muted">
                {" "}
                — {c.cities.length} cities,{" "}
                {c.cities.reduce((n, city) => n + city.themeParks.length, 0)} parks
              </span>
            </li>
          ))}
          {countries.length === 0 && <li className="muted">none yet</li>}
        </ul>

        <h3>Theme parks</h3>
        <ul className="plain">
          {parks.map(({ park, city, country }) => (
            <li key={park.id}>
              {park.name}
              <span className="muted">
                {" "}
                — {city}, {country}
              </span>
            </li>
          ))}
          {parks.length === 0 && <li className="muted">none yet</li>}
        </ul>

        <h3>Favourite coasters</h3>
        <ul className="plain">
          {favCoasters.map((f) => (
            <li key={`${f.park}-${f.name}`}>
              ★ {f.name}
              <span className="muted">
                {" "}
                — {f.park}
              </span>
            </li>
          ))}
          {favCoasters.length === 0 && <li className="muted">none set yet</li>}
        </ul>
      </div>
    </aside>
  );
}
