import { useEffect } from "react";

import "./panel.css";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DetailPanel({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside className="detail-panel">
      <button type="button" className="detail-panel__close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="detail-panel__body">{children}</div>
    </aside>
  );
}
