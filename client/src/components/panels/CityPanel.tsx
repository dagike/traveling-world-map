import type { CityWithParks, CountryWithChildren } from "@twm/shared";

import { PhotoStrip } from "../PhotoStrip";

interface Props {
  country: CountryWithChildren;
  city: CityWithParks;
  onSelectCountry: () => void;
}

export function CityPanel({ country, city, onSelectCountry }: Props) {
  return (
    <div>
      <button type="button" className="row-button" onClick={onSelectCountry}>
        ← {country.name}
      </button>

      <h2>{city.name}</h2>
      <div className="muted">
        {city.visitedYear ? `Visited ${city.visitedYear} · ` : ""}
        {city.themeParks.length} theme parks
      </div>

      <h3>Photos</h3>
      <PhotoStrip photos={city.photos} />

      {city.notes && (
        <>
          <h3>Notes</h3>
          <p>{city.notes}</p>
        </>
      )}

      <h3>Theme parks</h3>
      {city.themeParks.length === 0 && <p className="muted">No theme parks added yet.</p>}
      <ul className="plain">
        {city.themeParks.map((park) => {
          const fav = park.rides.find((r) => r.isFavourite && r.type === "coaster");
          return (
            <li key={park.id}>
              <div className="row-button">
                <strong>{park.name}</strong>
                {fav && <div className="fav">★ {fav.name}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
