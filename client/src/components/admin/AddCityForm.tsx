import { useState } from "react";

import { api, ApiError } from "../../api";
import type { StartPick } from "../../lib/util";
import "./admin.css";

interface Props {
  countryId: number;
  onStartPick: StartPick;
  onCreated: (cityId: number) => void;
}

export function AddCityForm({ countryId, onStartPick, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setLat("");
    setLng("");
    setYear("");
    setError(null);
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!name || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      setError("name and a location are required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const city = await api.createCity(countryId, {
        name,
        lat: latNum,
        lng: lngNum,
        visitedYear: year ? Number(year) : undefined,
      });
      onCreated(city.id);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "could not add city");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="row-button" onClick={() => setOpen(true)}>
        + add city
      </button>
    );
  }

  return (
    <form className="admin-inline-form" onSubmit={submit}>
      <input
        placeholder="City name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="admin-inline-form__row">
        <input
          placeholder="lat"
          inputMode="decimal"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          placeholder="lng"
          inputMode="decimal"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
        />
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
      <input
        placeholder="Year visited (optional)"
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <div className="admin-inline-form__row">
        <button type="submit" disabled={busy}>
          {busy ? "…" : "Add city"}
        </button>
        <button type="button" onClick={reset} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
