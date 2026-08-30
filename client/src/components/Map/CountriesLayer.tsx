import type { CountryWithChildren } from "@twm/shared";
import type { Layer, LeafletMouseEvent, PathOptions } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";

import { escapeHtml, mapSignature } from "../../lib/util";

export interface CountryFeatureProps {
  name: string;
  /** ISO alpha-3 style code (Natural Earth ADM0_A3). */
  code: string;
}

type CountryFeature = Feature<Geometry, CountryFeatureProps>;

const visitedStyle: PathOptions = {
  fillColor: "#10b981",
  fillOpacity: 0.34,
  color: "#047857",
  weight: 1.2,
};

const hoverStyle: PathOptions = { ...visitedStyle, fillOpacity: 0.58, weight: 2.2 };

const otherStyle: PathOptions = {
  fillColor: "#64748b",
  fillOpacity: 0,
  color: "#9aa8a1",
  weight: 0.5,
};

function tooltipHtml(country: CountryWithChildren): string {
  const cityList =
    country.cities.length > 0
      ? `<ul style="margin:4px 0 0;padding-left:16px">${country.cities
          .map((c) => `<li>${escapeHtml(c.name)}</li>`)
          .join("")}</ul>`
      : `<div style="opacity:0.7">no cities yet</div>`;
  return `<strong>${escapeHtml(country.name)}</strong>${cityList}`;
}

interface Props {
  countries: CountryWithChildren[];
  onSelectCountry: (country: CountryWithChildren) => void;
  /** While true the layer ignores clicks so map-location picking works. */
  pickActive: boolean;
}

export function CountriesLayer({ countries, onSelectCountry, pickActive }: Props) {
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

  const byCode = useMemo(() => {
    const map = new Map<string, CountryWithChildren>();
    for (const country of countries) map.set(country.isoA3, country);
    return map;
  }, [countries]);

  if (!geo) return null;

  const style = (feature?: CountryFeature): PathOptions => {
    const country = feature ? byCode.get(feature.properties.code) : undefined;
    return { ...(country ? visitedStyle : otherStyle), interactive: !pickActive };
  };

  const onEachFeature = (feature: CountryFeature, layer: Layer): void => {
    const country = byCode.get(feature.properties.code);
    if (!country) return;
    layer.bindTooltip(tooltipHtml(country), { sticky: true });
    layer.on({
      click: () => {
        if (!pickActive) onSelectCountry(country);
      },
      mouseover: (e: LeafletMouseEvent) => e.target.setStyle(hoverStyle),
      mouseout: (e: LeafletMouseEvent) => e.target.setStyle(visitedStyle),
    });
  };

  return (
    <GeoJSON
      key={`${mapSignature(countries)}|${pickActive ? "pick" : "nav"}`}
      data={geo}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
