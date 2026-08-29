import type { CityWithParks, CountryWithChildren } from "@twm/shared";

import type { StartPick } from "../../lib/util";
import { AddParkForm } from "../admin/AddParkForm";
import { CityAdmin } from "../admin/CityAdmin";
import { PhotoStrip } from "../PhotoStrip";

interface Props {
  country: CountryWithChildren;
  city: CityWithParks;
  isAdmin: boolean;
  onSelectCountry: () => void;
  onSelectPark: (parkId: number) => void;
  onStartPick: StartPick;
  onParkCreated: (parkId: number) => void;
  onChanged: () => void;
  onDeleted: () => void;
}

export function CityPanel({
  country,
  city,
  isAdmin,
  onSelectCountry,
  onSelectPark,
  onStartPick,
  onParkCreated,
  onChanged,
  onDeleted,
}: Props) {
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

      {isAdmin && (
        <CityAdmin
          city={city}
          onStartPick={onStartPick}
          onChanged={onChanged}
          onDeleted={onDeleted}
        />
      )}

      <h3>Photos</h3>
      <PhotoStrip photos={city.photos} />

      {city.notes && (
        <>
          <h3>Notes</h3>
          <p>{city.notes}</p>
        </>
      )}

      <h3>Theme parks</h3>
      {isAdmin && (
        <AddParkForm
          cityId={city.id}
          onStartPick={onStartPick}
          onCreated={onParkCreated}
        />
      )}
      {city.themeParks.length === 0 && <p className="muted">No theme parks added yet.</p>}
      <ul className="plain">
        {city.themeParks.map((park) => {
          const fav = park.rides.find((r) => r.isFavourite && r.type === "coaster");
          return (
            <li key={park.id}>
              <button
                type="button"
                className="row-button"
                onClick={() => onSelectPark(park.id)}
              >
                <strong>{park.name}</strong>
                {fav && <div className="fav">★ {fav.name}</div>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
