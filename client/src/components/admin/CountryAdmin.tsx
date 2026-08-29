import { useState } from "react";

import type { CountryWithChildren } from "@twm/shared";

import { api, ApiError } from "../../api";
import { DangerButton } from "./DangerButton";
import "./admin.css";

interface Props {
  country: CountryWithChildren;
  onChanged: () => void;
  onDeleted: () => void;
}

export function CountryAdmin({ country, onChanged, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(country.name);
  const [year, setYear] = useState(country.visitedYear?.toString() ?? "");
  const [notes, setNotes] = useState(country.notes ?? "");
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
          label="delete country"
          disabled={busy}
          onConfirm={() =>
            run(() => api.deleteCountry(country.id), onDeleted)
          }
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
            api.updateCountry(country.id, {
              name,
              visitedYear: year ? Number(year) : null,
              notes: notes || null,
            }),
          () => {
            setEditing(false);
            onChanged();
          },
        );
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Year visited"
      />
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
