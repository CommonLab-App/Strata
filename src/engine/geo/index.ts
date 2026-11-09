/** Great-circle helpers on a spherical Earth. Enough for lab maths; nobody is surveying with this. */
export const EARTH_RADIUS_KM = 6371

export interface LatLon {
  lat: number
  lon: number
}

const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Haversine distance in km. */
export function distanceKm(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Compass bearing from north, 0 to 360, for an east and a north component. */
export const azimuthDeg = (east: number, north: number) => (deg(Math.atan2(east, north)) + 360) % 360

/** The point `km` away from `from` along `bearing` (degrees from north). */
export function destination(from: LatLon, bearing: number, km: number): LatLon {
  if (km === 0) return from
  const d = km / EARTH_RADIUS_KM
  const b = rad(bearing)
  const lat1 = rad(from.lat)
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b))
  const lon2 = rad(from.lon) + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2))
  return { lat: deg(lat2), lon: ((deg(lon2) + 540) % 360) - 180 }
}
