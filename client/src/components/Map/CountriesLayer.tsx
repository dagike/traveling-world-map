import type { PathOptions } from "leaflet";
import { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export interface CountryFeatureProps {
  name: string;
  /** ISO alpha-3 style code (Natural Earth ADM0_A3). */
  code: string;
}

const visitedStyle: PathOptions = {
  fillColor: "#e8590c",
  fillOpacity: 0.55,
  color: "#e8590c",
  weight: 1,
};

const otherStyle: PathOptions = {
  fillColor: "#94a3b8",
  fillOpacity: 0,
  color: "#94a3b8",
  weight: 0.5,
};

interface Props {
  visitedCodes: Set<string>;
}

export function CountriesLayer({ visitedCodes }: Props) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry, CountryFeatureProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/countries.geo.json")
      .then((res) => res.json())
      .then((data: FeatureCollection<Geometry, CountryFeatureProps>) => {
        if (!cancelled) setGeo(data);
      })
      .catch(() => {
        if (!cancelled) setGeo(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!geo) return null;

  const style = (feature?: Feature<Geometry, CountryFeatureProps>): PathOptions => {
    const code = feature?.properties.code;
    return code && visitedCodes.has(code) ? visitedStyle : otherStyle;
  };

  return (
    <GeoJSON key={[...visitedCodes].sort().join(",")} data={geo} style={style} />
  );
}
