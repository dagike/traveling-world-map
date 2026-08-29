import type { CountryWithChildren } from "@twm/shared";

import { PhotoStrip } from "../PhotoStrip";

interface Props {
  country: CountryWithChildren;
}

export function CountryPanel({ country }: Props) {
  const parkCount = country.cities.reduce((n, c) => n + c.themeParks.length, 0);

  return (
    <div>
      <h2>{country.name}</h2>
      <div className="muted">
        {country.visitedYear ? `Visited ${country.visitedYear} · ` : ""}
        {country.cities.length} cities · {parkCount} theme parks
      </div>

      <h3>Photos</h3>
      <PhotoStrip photos={country.photos} />

      {country.notes && (
        <>
          <h3>Notes</h3>
          <p>{country.notes}</p>
        </>
      )}

      <h3>Cities</h3>
      {country.cities.length === 0 && <p className="muted">No cities added yet.</p>}
      <ul className="plain">
        {country.cities.map((city) => (
          <li key={city.id}>
            <div className="row-button">
              <strong>{city.name}</strong>
              {city.themeParks.length > 0 && (
                <div className="muted">
                  {city.themeParks.map((p) => p.name).join(", ")}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
