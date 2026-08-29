import type { CountryWithChildren } from "@twm/shared";

import type { StartPick } from "../../lib/util";
import { AddCityForm } from "../admin/AddCityForm";
import { CountryAdmin } from "../admin/CountryAdmin";
import { PhotoStrip } from "../PhotoStrip";

interface Props {
  country: CountryWithChildren;
  isAdmin: boolean;
  onSelectCity: (cityId: number) => void;
  onStartPick: StartPick;
  onCityCreated: (cityId: number) => void;
  onChanged: () => void;
  onDeleted: () => void;
}

export function CountryPanel({
  country,
  isAdmin,
  onSelectCity,
  onStartPick,
  onCityCreated,
  onChanged,
  onDeleted,
}: Props) {
  const parkCount = country.cities.reduce((n, c) => n + c.themeParks.length, 0);

  return (
    <div>
      <h2>{country.name}</h2>
      <div className="muted">
        {country.visitedYear ? `Visited ${country.visitedYear} · ` : ""}
        {country.cities.length} cities · {parkCount} theme parks
      </div>

      {isAdmin && (
        <CountryAdmin country={country} onChanged={onChanged} onDeleted={onDeleted} />
      )}

      <h3>Photos</h3>
      <PhotoStrip photos={country.photos} />

      {country.notes && (
        <>
          <h3>Notes</h3>
          <p>{country.notes}</p>
        </>
      )}

      <h3>Cities</h3>
      {isAdmin && (
        <AddCityForm
          countryId={country.id}
          onStartPick={onStartPick}
          onCreated={onCityCreated}
        />
      )}
      {country.cities.length === 0 && <p className="muted">No cities added yet.</p>}
      <ul className="plain">
        {country.cities.map((city) => (
          <li key={city.id}>
            <button
              type="button"
              className="row-button"
              onClick={() => onSelectCity(city.id)}
            >
              <strong>{city.name}</strong>
              {city.themeParks.length > 0 && (
                <div className="muted">
                  {city.themeParks.map((p) => p.name).join(", ")}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
