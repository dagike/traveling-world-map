import { useState } from "react";

import type { ThemeParkWithRides } from "@twm/shared";

import { api, ApiError } from "../../api";
import type { StartPick } from "../../lib/util";
import { DangerButton } from "./DangerButton";
import "./admin.css";

interface Props {
  park: ThemeParkWithRides;
  onStartPick: StartPick;
  onChanged: () => void;
  onDeleted: () => void;
}

export function ParkAdmin({ park, onStartPick, onChanged, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(park.name);
  const [lat, setLat] = useState(park.lat.toString());
  const [lng, setLng] = useState(park.lng.toString());
  const [info, setInfo] = useState(park.info ?? "");
  const [year, setYear] = useState(park.visitedYear?.toString() ?? "");
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
          label="delete park"
          disabled={busy}
          onConfirm={() => run(() => api.deleteThemePark(park.id), onDeleted)}
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
            api.updateThemePark(park.id, {
              name,
              lat: Number(lat),
              lng: Number(lng),
              info: info || null,
              visitedYear: year ? Number(year) : null,
            }),
          () => {
            setEditing(false);
            onChanged();
          },
        );
      }}
    >
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
      <input value={info} onChange={(e) => setInfo(e.target.value)} placeholder="Info" />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Year visited"
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
