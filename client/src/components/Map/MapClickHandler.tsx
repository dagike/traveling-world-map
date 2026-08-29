import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

interface Props {
  active: boolean;
  onPick: (lat: number, lng: number) => void;
}

export function MapClickHandler({ active, onPick }: Props) {
  const map = useMapEvents({
    click: (e) => {
      if (active) onPick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = active ? "crosshair" : "";
    return () => {
      container.style.cursor = "";
    };
  }, [active, map]);

  return null;
}
