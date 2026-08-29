import { useState } from "react";

import { AdminBar } from "./components/admin/AdminBar";
import { LoginModal } from "./components/admin/LoginModal";
import { MapView } from "./components/Map/MapView";
import { CityPanel } from "./components/panels/CityPanel";
import { CountryPanel } from "./components/panels/CountryPanel";
import { DetailPanel } from "./components/panels/DetailPanel";
import { ParkPanel } from "./components/panels/ParkPanel";
import { useAuth } from "./hooks/useAuth";
import { useMapData } from "./hooks/useMapData";
import { findCity, findPark } from "./lib/util";

type Selection =
  | { kind: "country"; isoA3: string }
  | { kind: "city"; id: number }
  | { kind: "park"; id: number };

export function App() {
  const { countries, error } = useMapData();
  const { isAdmin, login, logout } = useAuth();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const selectCountry = (isoA3: string) => setSelection({ kind: "country", isoA3 });
  const selectCity = (id: number) => setSelection({ kind: "city", id });
  const selectPark = (id: number) => setSelection({ kind: "park", id });
  const close = () => setSelection(null);

  let panel: React.ReactNode = null;
  if (selection?.kind === "country") {
    const country = countries.find((c) => c.isoA3 === selection.isoA3);
    if (country) {
      panel = <CountryPanel country={country} onSelectCity={selectCity} />;
    }
  } else if (selection?.kind === "city") {
    const found = findCity(countries, selection.id);
    if (found) {
      panel = (
        <CityPanel
          country={found.country}
          city={found.city}
          onSelectCountry={() => selectCountry(found.country.isoA3)}
          onSelectPark={selectPark}
        />
      );
    }
  } else if (selection?.kind === "park") {
    const found = findPark(countries, selection.id);
    if (found) {
      panel = (
        <ParkPanel
          city={found.city}
          park={found.park}
          onSelectCity={() => selectCity(found.city.id)}
        />
      );
    }
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapView
        countries={countries}
        onSelectCountry={(c) => selectCountry(c.isoA3)}
        onSelectCity={selectCity}
        onSelectPark={selectPark}
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
        <AdminBar
          isAdmin={isAdmin}
          onLoginClick={() => setLoginOpen(true)}
          onLogout={logout}
        />
      </div>

      <DetailPanel open={panel !== null} onClose={close}>
        {panel}
      </DetailPanel>

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} onSubmit={login} />
      )}
    </div>
  );
}
