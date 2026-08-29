import type { CountryWithChildren, Photo } from "@twm/shared";
import type { PathOptions } from "leaflet";
import { CircleMarker, Tooltip } from "react-leaflet";

const cityStyle: PathOptions = {
  color: "#1d4ed8",
  fillColor: "#3b82f6",
  fillOpacity: 0.9,
  weight: 2,
};

const thumb: React.CSSProperties = {
  width: 54,
  height: 38,
  borderRadius: 4,
  background: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 9,
  color: "#64748b",
};

function previewPhotos(photos: Photo[]): Photo[] {
  if (photos.length > 0) return photos.slice(0, 3);
  return [
    { url: "", caption: "photo" },
    { url: "", caption: "photo" },
    { url: "", caption: "photo" },
  ];
}

interface Props {
  countries: CountryWithChildren[];
  onSelectCity: (cityId: number) => void;
}

export function CityMarkers({ countries, onSelectCity }: Props) {
  return (
    <>
      {countries.flatMap((country) =>
        country.cities.map((city) => (
          <CircleMarker
            key={city.id}
            center={[city.lat, city.lng]}
            radius={5}
            pathOptions={cityStyle}
            eventHandlers={{ click: () => onSelectCity(city.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div style={{ maxWidth: 190 }}>
                <strong>{city.name}</strong>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {previewPhotos(city.photos).map((photo, i) =>
                    photo.url ? (
                      <img
                        key={i}
                        src={photo.url}
                        alt={photo.caption ?? ""}
                        style={{ ...thumb, objectFit: "cover" }}
                      />
                    ) : (
                      <div key={i} style={thumb}>
                        {photo.caption ?? "photo"}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        )),
      )}
    </>
  );
}
