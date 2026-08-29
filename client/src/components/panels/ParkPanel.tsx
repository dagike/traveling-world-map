import type { CityWithParks, ThemeParkWithRides } from "@twm/shared";

import type { StartPick } from "../../lib/util";
import { AddRideForm } from "../admin/AddRideForm";
import { ParkAdmin } from "../admin/ParkAdmin";
import { RideRow } from "../admin/RideRow";
import { PhotoStrip } from "../PhotoStrip";

interface Props {
  city: CityWithParks;
  park: ThemeParkWithRides;
  isAdmin: boolean;
  onSelectCity: () => void;
  onStartPick: StartPick;
  onChanged: () => void;
  onDeleted: () => void;
}

export function ParkPanel({
  city,
  park,
  isAdmin,
  onSelectCity,
  onStartPick,
  onChanged,
  onDeleted,
}: Props) {
  const favCoaster = park.rides.find((r) => r.isFavourite && r.type === "coaster");
  const favFlat = park.rides.find((r) => r.isFavourite && r.type === "flat");

  return (
    <div>
      <button type="button" className="row-button" onClick={onSelectCity}>
        ← {city.name}
      </button>

      <h2>{park.name}</h2>
      {park.visitedYear && <div className="muted">Visited {park.visitedYear}</div>}

      {isAdmin && (
        <ParkAdmin
          park={park}
          onStartPick={onStartPick}
          onChanged={onChanged}
          onDeleted={onDeleted}
        />
      )}

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
      {isAdmin && <AddRideForm park={park} onChanged={onChanged} />}
      {park.rides.length === 0 && <p className="muted">No rides added yet.</p>}
      <ul className="plain">
        {park.rides.map((ride) => (
          <RideRow
            key={ride.id}
            ride={ride}
            park={park}
            isAdmin={isAdmin}
            onChanged={onChanged}
          />
        ))}
      </ul>
    </div>
  );
}
