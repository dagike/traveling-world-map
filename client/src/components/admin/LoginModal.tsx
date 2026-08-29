import { useEffect, useState } from "react";

import { ApiError } from "../../api";
import "./admin.css";

interface Props {
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

export function LoginModal({ onClose, onSubmit }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(password);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h2>Admin login</h2>
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" disabled={busy || password.length === 0}>
            {busy ? "…" : "Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}
