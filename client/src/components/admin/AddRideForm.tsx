import { useState } from "react";

import type { RideType, ThemeParkWithRides } from "@twm/shared";

import { api, ApiError } from "../../api";
import "./admin.css";

interface Props {
  park: ThemeParkWithRides;
  onChanged: () => void;
}

export function AddRideForm({ park, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<RideType>("coaster");
  const [isFavourite, setIsFavourite] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setType("coaster");
    setIsFavourite(false);
    setNotes("");
    setError(null);
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setError("name is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (isFavourite) {
        // Only one favourite per type: clear the current one first.
        const current = park.rides.find((r) => r.isFavourite && r.type === type);
        if (current) await api.updateRide(current.id, { isFavourite: false });
      }
      await api.createRide(park.id, {
        name,
        type,
        isFavourite,
        notes: notes || undefined,
      });
      onChanged();
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "could not add ride");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="row-button" onClick={() => setOpen(true)}>
        + add ride
      </button>
    );
  }

  return (
    <form className="admin-inline-form" onSubmit={submit}>
      <input
        placeholder="Ride name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
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
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <div className="admin-inline-form__row">
        <button type="submit" disabled={busy}>
          {busy ? "…" : "Add ride"}
        </button>
        <button type="button" onClick={reset} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
