import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";

const WORLD_CENTER: [number, number] = [20, 0];

export function MapView() {
  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={2}
      minZoom={2}
      worldCopyJump
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}
