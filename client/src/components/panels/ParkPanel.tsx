import type { CityWithParks, ThemeParkWithRides } from "@twm/shared";

import { PhotoStrip } from "../PhotoStrip";

interface Props {
  city: CityWithParks;
  park: ThemeParkWithRides;
  onSelectCity: () => void;
}

export function ParkPanel({ city, park, onSelectCity }: Props) {
  const favCoaster = park.rides.find((r) => r.isFavourite && r.type === "coaster");
  const favFlat = park.rides.find((r) => r.isFavourite && r.type === "flat");

  return (
    <div>
      <button type="button" className="row-button" onClick={onSelectCity}>
        ← {city.name}
      </button>

      <h2>{park.name}</h2>
      {park.visitedYear && <div className="muted">Visited {park.visitedYear}</div>}

      <h3>Photos</h3>
      <PhotoStrip photos={park.photos} />

      {park.info && (
        <>
          <h3>About</h3>
          <p>{park.info}</p>
        </>
      )}

      <h3>Favourites</h3>
      <p className={favCoaster ? "fav" : "muted"}>
        ★ Coaster: {favCoaster ? favCoaster.name : "not set"}
      </p>
      <p className={favFlat ? "fav" : "muted"}>
        ★ Flat ride: {favFlat ? favFlat.name : "not set"}
      </p>

      <h3>All rides</h3>
      {park.rides.length === 0 && <p className="muted">No rides added yet.</p>}
      <ul className="plain">
        {park.rides.map((ride) => (
          <li key={ride.id} className="row-button">
            <strong>{ride.name}</strong>
            <div className="muted">
              {ride.type}
              {ride.isFavourite ? " · ★ favourite" : ""}
            </div>
            {ride.notes && <div className="muted">{ride.notes}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
