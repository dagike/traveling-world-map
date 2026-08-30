import { useEffect, useState } from "react";

import { api, ApiError } from "../../api";
import "./admin.css";

interface Props {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: Props) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      setError("new password must be at least 8 characters");
      return;
    }
    if (next !== confirm) {
      setError("new passwords do not match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.changePassword(current, next);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "could not change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h2>Change password</h2>

        {done ? (
          <>
            <p style={{ margin: "0 0 4px" }}>Password updated.</p>
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Your current session stays signed in.
            </p>
            <div className="actions">
              <button type="button" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <label htmlFor="cp-current">Current password</label>
            <input
              id="cp-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <label htmlFor="cp-next" style={{ marginTop: 12 }}>
              New password
            </label>
            <input
              id="cp-next"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
            <label htmlFor="cp-confirm" style={{ marginTop: 12 }}>
              Confirm new password
            </label>
            <input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <div className="actions">
              <button type="button" onClick={onClose} disabled={busy}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !current || !next || !confirm}
              >
                {busy ? "…" : "Update"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
