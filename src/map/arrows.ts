import { destination, azimuthDeg } from '@/engine/geo'
import type { MapLine } from './types'

/** Default scale: 20 mm/yr draws as 200 km on the globe, long enough to read at continent zoom. */
export const KM_PER_MM_YR = 10

/**
 * A velocity as an arrow: a shaft from the station along its direction of motion, with a short barb. Length is
 * proportional to speed so that two stations' arrows compare by eye.
 */
export function velocityArrow(id: string, station: { lat: number; lon: number }, v: { ve: number; vn: number }, colour: string, kmPerMmYr = KM_PER_MM_YR): MapLine {
  const speed = Math.hypot(v.ve, v.vn)
  const bearing = azimuthDeg(v.ve, v.vn)
  const head = destination(station, bearing, speed * kmPerMmYr)
  const barb = Math.min(40, speed * kmPerMmYr * 0.3)
  const left = destination(head, bearing + 150, barb)
  const right = destination(head, bearing - 150, barb)
  return { id, colour, width: 2, coordinates: [[station.lon, station.lat], [head.lon, head.lat], [left.lon, left.lat], [head.lon, head.lat], [right.lon, right.lat]] }
}
