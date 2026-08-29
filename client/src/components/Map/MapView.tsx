import "leaflet/dist/leaflet.css";

import type { CountryWithChildren } from "@twm/shared";
import { MapContainer, TileLayer } from "react-leaflet";

import { CountriesLayer } from "./CountriesLayer";

const WORLD_CENTER: [number, number] = [20, 0];

interface Props {
  countries: CountryWithChildren[];
  onSelectCountry: (country: CountryWithChildren) => void;
}

export function MapView({ countries, onSelectCountry }: Props) {
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
      <CountriesLayer countries={countries} onSelectCountry={onSelectCountry} />
    </MapContainer>
  );
}
