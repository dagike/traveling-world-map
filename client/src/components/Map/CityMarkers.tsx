import type { CountryWithChildren, Photo } from "@twm/shared";
import type { PathOptions } from "leaflet";
import { CircleMarker, Tooltip } from "react-leaflet";

const visitedCityStyle: PathOptions = {
  color: "#ffffff",
  fillColor: "#0b3d2e",
  fillOpacity: 1,
  weight: 2.5,
};

const wishlistCityStyle: PathOptions = { ...visitedCityStyle, fillColor: "#db2777" };

const thumb: React.CSSProperties = {
  width: 54,
  height: 38,
  borderRadius: 6,
  background: "var(--surface-3, #e9efeb)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 9,
  color: "var(--text-muted, #5c6b64)",
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
  pickActive: boolean;
}

export function CityMarkers({ countries, onSelectCity, pickActive }: Props) {
  return (
    <>
      {countries.flatMap((country) =>
        country.cities.map((city) => (
          <CircleMarker
            key={`${city.id}|${pickActive ? "p" : "n"}|${city.status}`}
            center={[city.lat, city.lng]}
            radius={5}
            pathOptions={
              city.status === "wishlist" ? wishlistCityStyle : visitedCityStyle
            }
            interactive={!pickActive}
            eventHandlers={{
              click: () => {
                if (!pickActive) onSelectCity(city.id);
              },
            }}
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
