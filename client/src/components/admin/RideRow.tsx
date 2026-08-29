import { useState } from "react";

import type { RideType, Ride, ThemeParkWithRides } from "@twm/shared";

import { api, ApiError } from "../../api";
import { DangerButton } from "./DangerButton";
import "./admin.css";

interface Props {
  ride: Ride;
  park: ThemeParkWithRides;
  isAdmin: boolean;
  onChanged: () => void;
}

export function RideRow({ ride, park, isAdmin, onChanged }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ride.name);
  const [type, setType] = useState<RideType>(ride.type);
  const [isFavourite, setIsFavourite] = useState(ride.isFavourite);
  const [notes, setNotes] = useState(ride.notes ?? "");
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

  async function save() {
    if (isFavourite) {
      const current = park.rides.find(
        (r) => r.isFavourite && r.type === type && r.id !== ride.id,
      );
      if (current) await api.updateRide(current.id, { isFavourite: false });
    }
    await api.updateRide(ride.id, {
      name,
      type,
      isFavourite,
      notes: notes || undefined,
    });
  }

  if (!editing) {
    return (
      <li className="row-button">
        <strong>{ride.name}</strong>
        <div className="muted">
          {ride.type}
          {ride.isFavourite ? " · ★ favourite" : ""}
        </div>
        {ride.notes && <div className="muted">{ride.notes}</div>}
        {isAdmin && (
          <div className="ride-row__actions">
            <button type="button" onClick={() => setEditing(true)}>
              edit
            </button>
            <DangerButton
              label="delete"
              disabled={busy}
              onConfirm={() => run(() => api.deleteRide(ride.id), onChanged)}
            />
            {error && <span className="error">{error}</span>}
          </div>
        )}
      </li>
    );
  }

  return (
    <li>
      <form
        className="admin-inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(save, () => {
            setEditing(false);
            onChanged();
          });
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <div className="admin-inline-form__row">
          <select value={type} onChange={(e) => setType(e.target.value as RideType)}>
            <option value="coaster">coaster</option>
            <option value="flat">flat ride</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="checkbox"
              checked={isFavourite}
              onChange={(e) => setIsFavourite(e.target.checked)}
              style={{ width: "auto" }}
            />
            favourite
          </label>
        </div>
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
    </li>
  );
}
