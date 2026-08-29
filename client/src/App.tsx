import { useState } from "react";

import { MapView } from "./components/Map/MapView";
import { CountryPanel } from "./components/panels/CountryPanel";
import { DetailPanel } from "./components/panels/DetailPanel";
import { useMapData } from "./hooks/useMapData";

type Selection = { kind: "country"; isoA3: string };

export function App() {
  const { countries, error } = useMapData();
  const [selection, setSelection] = useState<Selection | null>(null);

  const selectedCountry =
    selection?.kind === "country"
      ? (countries.find((c) => c.isoA3 === selection.isoA3) ?? null)
      : null;

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapView
        countries={countries}
        onSelectCountry={(c) => setSelection({ kind: "country", isoA3: c.isoA3 })}
      />
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

      <DetailPanel open={selectedCountry !== null} onClose={() => setSelection(null)}>
        {selectedCountry && <CountryPanel country={selectedCountry} />}
      </DetailPanel>
    </div>
  );
}
