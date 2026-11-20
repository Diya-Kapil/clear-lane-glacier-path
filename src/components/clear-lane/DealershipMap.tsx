/** Browser-only map (Leaflet). Loaded lazily behind <ClientOnly>. */
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapDealer } from "./map-types";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
  }, [map, points]);
  return null;
}

export default function DealershipMap({ dealers, origin, activeId, onSelect, onTilesFailed }: {
  dealers: MapDealer[];
  origin: { lat: number; lng: number };
  activeId: string | null;
  onSelect: (id: string) => void;
  onTilesFailed: () => void;
}) {
  const errors = useRef(0);
  const points = useMemo<[number, number][]>(
    () => [[origin.lat, origin.lng], ...dealers.map((d) => [d.lat, d.lng] as [number, number])],
    [dealers, origin],
  );

  return (
    <MapContainer center={[origin.lat, origin.lng]} zoom={10} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        eventHandlers={{
          tileerror: () => {
            errors.current += 1;
            if (errors.current === 4) onTilesFailed();
          },
        }}
      />
      <FitBounds points={points} />
      <Marker position={[origin.lat, origin.lng]} icon={L.divIcon({ className: "", html: '<div class="cl-me"></div>', iconSize: [18, 18] })} keyboard={false}>
        <Tooltip>You are here</Tooltip>
      </Marker>
      {dealers.map((d, i) => (
        <Marker
          key={d.id}
          position={[d.lat, d.lng]}
          title={`${i + 1}. ${d.name}, ${d.distanceLabel}`}
          icon={L.divIcon({
            className: "",
            html: `<div class="cl-marker" data-active="${d.id === activeId}">${i + 1}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          })}
          eventHandlers={{ click: () => onSelect(d.id) }}
        >
          <Tooltip direction="top" offset={[0, -16]}>{d.name}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
