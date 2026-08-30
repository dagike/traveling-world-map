import { useEffect } from "react";

import type { CountryWithChildren } from "@twm/shared";

import "./panels/panel.css";

interface Props {
  countries: CountryWithChildren[];
  onSelectCountry: (isoA3: string) => void;
  onSelectCity: (cityId: number) => void;
  onSelectPark: (parkId: number) => void;
  onClose: () => void;
}

export function WishlistView({
  countries,
  onSelectCountry,
  onSelectCity,
  onSelectPark,
  onClose,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const wishCountries = countries.filter((c) => c.status === "wishlist");
  const wishCities = countries.flatMap((c) =>
    c.cities
      .filter((ci) => ci.status === "wishlist")
      .map((ci) => ({ city: ci, country: c })),
  );
  const wishParks = countries.flatMap((c) =>
    c.cities.flatMap((ci) =>
      ci.themeParks
        .filter((p) => p.status === "wishlist")
        .map((p) => ({ park: p, city: ci, country: c })),
    ),
  );

  const total = wishCountries.length + wishCities.length + wishParks.length;

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
        <h2>
          Wishlist <span className="status-badge status-badge--wishlist">{total}</span>
        </h2>

        {total === 0 && (
          <p className="muted">
            Nothing on the wishlist yet — add a country, city or park and choose “Want to go”.
          </p>
        )}

        {wishCountries.length > 0 && (
          <>
            <h3>Countries</h3>
            <ul className="plain">
              {wishCountries.map((c) => (
                <li key={c.isoA3}>
                  <button
                    type="button"
                    className="row-button"
                    onClick={() => onSelectCountry(c.isoA3)}
                  >
                    <strong>{c.name}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {wishCities.length > 0 && (
          <>
            <h3>Cities</h3>
            <ul className="plain">
              {wishCities.map(({ city, country }) => (
                <li key={city.id}>
                  <button
                    type="button"
                    className="row-button"
                    onClick={() => onSelectCity(city.id)}
                  >
                    <strong>{city.name}</strong>
                    <div className="muted">{country.name}</div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {wishParks.length > 0 && (
          <>
            <h3>Theme parks</h3>
            <ul className="plain">
              {wishParks.map(({ park, city, country }) => (
                <li key={park.id}>
                  <button
                    type="button"
                    className="row-button"
                    onClick={() => onSelectPark(park.id)}
                  >
                    <strong>{park.name}</strong>
                    <div className="muted">
                      {city.name}, {country.name}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
