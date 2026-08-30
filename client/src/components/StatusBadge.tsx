import type { PlaceStatus } from "@twm/shared";

import "./panels/panel.css";

export function StatusBadge({ status }: { status: PlaceStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status === "wishlist" ? "Wishlist" : "Visited"}
    </span>
  );
}
