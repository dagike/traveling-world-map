import type { Photo } from "@twm/shared";

interface Props {
  photos: Photo[];
  placeholders?: number;
}

const box: React.CSSProperties = {
  flex: "0 0 auto",
  width: 120,
  height: 84,
  borderRadius: 8,
  background: "var(--surface-3, #e9efeb)",
  border: "1px solid var(--border, #dbe4df)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  color: "var(--text-muted, #5c6b64)",
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
