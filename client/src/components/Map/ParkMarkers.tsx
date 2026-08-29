import type { CountryWithChildren } from "@twm/shared";
import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

const parkIcon = L.divIcon({
  className: "park-marker",
  html: '<span class="park-marker__dot">🎢</span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface Props {
  countries: CountryWithChildren[];
  onSelectPark: (parkId: number) => void;
}

export function ParkMarkers({ countries, onSelectPark }: Props) {
  return (
    <>
      {countries.flatMap((country) =>
        country.cities.flatMap((city) =>
          city.themeParks.map((park) => {
            const favCoaster = park.rides.find((r) => r.isFavourite && r.type === "coaster");
            const favFlat = park.rides.find((r) => r.isFavourite && r.type === "flat");
            return (
              <Marker
                key={park.id}
                position={[park.lat, park.lng]}
                icon={parkIcon}
                eventHandlers={{ click: () => onSelectPark(park.id) }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <div style={{ maxWidth: 220 }}>
                    <strong>{park.name}</strong>
                    {park.info && <div className="muted">{park.info}</div>}
                    {favCoaster && (
                      <div className="fav">★ coaster: {favCoaster.name}</div>
                    )}
                    {favFlat && <div className="fav">★ flat ride: {favFlat.name}</div>}
                  </div>
                </Tooltip>
              </Marker>
            );
          }),
        ),
      )}
    </>
  );
}
