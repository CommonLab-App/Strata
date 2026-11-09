import { destination, type LatLon } from '@/engine/geo'
import type { MapLine } from './types'

/** A circle of radius `km` around a point, as a closed polyline of 72 vertices. */
export function circleLine(id: string, centre: LatLon, km: number, colour: string, width = 1.5): MapLine {
  const coordinates: [number, number][] = []
  for (let b = 0; b <= 360; b += 5) {
    const p = destination(centre, b, km)
    coordinates.push([p.lon, p.lat])
  }
  return { id, coordinates, colour, width }
}
