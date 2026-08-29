import { MapView } from "./components/Map/MapView";

export function App() {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapView />
      <h1
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          margin: 0,
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: "1rem",
          background: "rgba(255, 255, 255, 0.9)",
          color: "#111",
          pointerEvents: "none",
        }}
      >
        traveling world map
      </h1>
    </div>
  );
}
