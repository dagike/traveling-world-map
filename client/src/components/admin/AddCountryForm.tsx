import { useEffect, useMemo, useState } from "react";

import { api, ApiError } from "../../api";
import { useCountryCatalog } from "../../hooks/useCountryCatalog";
import "./admin.css";

interface Props {
  visitedCodes: Set<string>;
  onClose: () => void;
  onCreated: (isoA3: string) => void;
}

export function AddCountryForm({ visitedCodes, onClose, onCreated }: Props) {
  const catalog = useCountryCatalog();
  const options = useMemo(
    () => catalog.filter((c) => !visitedCodes.has(c.code)),
    [catalog, visitedCodes],
  );

  const [code, setCode] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const entry = options.find((c) => c.code === code);
    if (!entry) return;
    setBusy(true);
    setError(null);
    try {
      await api.createCountry({
        name: entry.name,
        isoA3: entry.code,
        visitedYear: year ? Number(year) : undefined,
      });
      onCreated(entry.code);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "could not add country");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h2>Add a country</h2>

        <label htmlFor="add-country-select">Country</label>
        <select
          id="add-country-select"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <label htmlFor="add-country-year" style={{ marginTop: 12 }}>
          Year visited (optional)
        </label>
        <input
          id="add-country-year"
          type="number"
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" disabled={busy || code === ""}>
            {busy ? "…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
