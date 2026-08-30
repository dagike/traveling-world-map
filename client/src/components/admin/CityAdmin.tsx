import { useState } from "react";

import type { CityWithParks, PlaceStatus } from "@twm/shared";

import { api, ApiError } from "../../api";
import type { StartPick } from "../../lib/util";
import { DangerButton } from "./DangerButton";
import { StatusToggle } from "./StatusToggle";
import { PlaceSearch } from "./PlaceSearch";
import "./admin.css";

interface Props {
  city: CityWithParks;
  onStartPick: StartPick;
  onChanged: () => void;
  onDeleted: () => void;
}

export function CityAdmin({ city, onStartPick, onChanged, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(city.name);
  const [lat, setLat] = useState(city.lat.toString());
  const [lng, setLng] = useState(city.lng.toString());
  const [year, setYear] = useState(city.visitedYear?.toString() ?? "");
  const [notes, setNotes] = useState(city.notes ?? "");
  const [status, setStatus] = useState<PlaceStatus>(city.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, after: () => void) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      after();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "request failed");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <div className="admin-actions">
        <button type="button" onClick={() => setEditing(true)}>
          edit
        </button>
        <DangerButton
          label="delete city"
          disabled={busy}
          onConfirm={() => run(() => api.deleteCity(city.id), onDeleted)}
        />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }

  return (
    <form
      className="admin-inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () =>
            api.updateCity(city.id, {
              name,
              status,
              lat: Number(lat),
              lng: Number(lng),
              visitedYear: status === "visited" && year ? Number(year) : null,
              notes: notes || null,
            }),
          () => {
            setEditing(false);
            onChanged();
          },
        );
      }}
    >
      <StatusToggle value={status} onChange={setStatus} />
      <PlaceSearch
        onPick={(place) => {
          setLat(place.lat);
          setLng(place.lng);
        }}
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <div className="admin-inline-form__row">
        <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="lat" />
        <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="lng" />
        <button
          type="button"
          onClick={() =>
            onStartPick((pLat, pLng) => {
              setLat(pLat.toFixed(4));
              setLng(pLng.toFixed(4));
            })
          }
        >
          pick on map
        </button>
      </div>
      {status === "visited" && (
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year visited"
        />
      )}
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
      />
      {error && <p className="error">{error}</p>}
      <div className="admin-inline-form__row">
        <button type="submit" disabled={busy}>
          {busy ? "…" : "Save"}
        </button>
        <button type="button" disabled={busy} onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
