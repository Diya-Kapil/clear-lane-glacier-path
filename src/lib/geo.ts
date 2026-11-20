/** Distance helpers (pure, unit-tested). */
export interface LatLng { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine formula). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const kmToMiles = (km: number) => km * 0.621371;

/** Human-friendly distance label, e.g. "3.2 mi". */
export function formatMiles(km: number): string {
  const mi = kmToMiles(km);
  if (mi < 0.1) return "Under 0.1 mi";
  return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
}

/** Sort any items with coordinates by distance from an origin. */
export function sortByDistance<T extends LatLng>(items: T[], origin: LatLng): Array<T & { distanceKm: number }> {
  return items
    .map((item) => ({ ...item, distanceKm: haversineKm(origin, item) }))
    .sort((x, y) => x.distanceKm - y.distanceKm);
}
