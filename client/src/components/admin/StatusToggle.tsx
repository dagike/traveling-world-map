import type { PlaceStatus } from "@twm/shared";

import "./admin.css";

interface Props {
  value: PlaceStatus;
  onChange: (value: PlaceStatus) => void;
}

export function StatusToggle({ value, onChange }: Props) {
  return (
    <div className="status-toggle" role="group" aria-label="Place status">
      <button
        type="button"
        className={value === "visited" ? "is-active" : ""}
        onClick={() => onChange("visited")}
      >
        Been here
      </button>
      <button
        type="button"
        className={value === "wishlist" ? "is-active wish" : ""}
        onClick={() => onChange("wishlist")}
      >
        Want to go
      </button>
    </div>
  );
}
