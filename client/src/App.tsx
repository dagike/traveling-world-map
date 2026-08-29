import { useMemo } from "react";

import { MapView } from "./components/Map/MapView";
import { useMapData } from "./hooks/useMapData";

export function App() {
  const { countries, error } = useMapData();

  const visitedCodes = useMemo(
    () => new Set(countries.map((c) => c.isoA3)),
    [countries],
  );

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapView visitedCodes={visitedCodes} />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: "1rem",
          fontWeight: 600,
          background: "rgba(255, 255, 255, 0.9)",
          color: "#111",
        }}
      >
        traveling world map
        {error && (
          <span style={{ color: "crimson", fontWeight: 400 }}> — API error: {error}</span>
        )}
      </div>
    </div>
  );
}
