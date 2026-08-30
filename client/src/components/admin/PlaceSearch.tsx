import { useEffect, useState } from "react";

import "./admin.css";

export interface PlaceResult {
  name: string;
  lat: string;
  lng: string;
}

interface NominatimHit {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
}

interface Props {
  onPick: (place: PlaceResult) => void;
}

/** Geocodes a free-text query via OpenStreetMap Nominatim (no API key). */
export function PlaceSearch({ onPick }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<PlaceResult & { label: string }> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=en&q=${encodeURIComponent(q)}`,
          { signal: controller.signal, headers: { Accept: "application/json" } },
        );
        const data = (await res.json()) as NominatimHit[];
        setResults(
          data.map((hit) => ({
            label: hit.display_name,
            name: hit.name || hit.display_name.split(",")[0]!.trim(),
            lat: Number(hit.lat).toFixed(4),
            lng: Number(hit.lon).toFixed(4),
          })),
        );
      } catch {
        if (!controller.signal.aborted) setError("search failed, try again");
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="place-search">
      <input
        placeholder="Search a place…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <div className="place-search__hint">searching…</div>}
      {error && <div className="place-search__hint error">{error}</div>}
      {results && results.length === 0 && (
        <div className="place-search__hint">no matches</div>
      )}
      {results && results.length > 0 && (
        <ul className="place-search__results">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onPick({ name: r.name, lat: r.lat, lng: r.lng });
                  setResults(null);
                  setQuery("");
                }}
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
