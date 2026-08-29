import type { Photo } from "@twm/shared";

interface Props {
  photos: Photo[];
  placeholders?: number;
}

const box: React.CSSProperties = {
  flex: "0 0 auto",
  width: 120,
  height: 84,
  borderRadius: 6,
  background: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  color: "#64748b",
  overflow: "hidden",
};

export function PhotoStrip({ photos, placeholders = 3 }: Props) {
  const items =
    photos.length > 0
      ? photos
      : Array.from({ length: placeholders }, (): Photo => ({ url: "", caption: "photo" }));

  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 0" }}>
      {items.map((photo, i) =>
        photo.url ? (
          <img
            key={i}
            src={photo.url}
            alt={photo.caption ?? ""}
            style={{ ...box, objectFit: "cover" }}
          />
        ) : (
          <div key={i} style={box}>
            {photo.caption ?? "photo"}
          </div>
        ),
      )}
    </div>
  );
}
