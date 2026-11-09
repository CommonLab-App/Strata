import { seeded } from '../random'

/** Crater counting for week 18. Craters are points with a diameter in km; regions are latitude-longitude boxes. */
export interface Crater {
  lat: number
  lon: number
  /** km */
  diameter: number
}

export interface Box {
  south: number
  north: number
  west: number
  east: number
}

export const inBox = (c: { lat: number; lon: number }, b: Box) => c.lat >= b.south && c.lat <= b.north && c.lon >= b.west && c.lon <= b.east

/** Craters in the box at or above the diameter threshold. */
export const countCraters = (craters: readonly Crater[], box: Box, minDiameter: number) => craters.filter((c) => c.diameter >= minDiameter && inBox(c, box)).length

/** Area of a latitude-longitude box on a sphere, km². */
export function boxAreaKm2(box: Box, radiusKm: number): number {
  const rad = (d: number) => (d * Math.PI) / 180
  return radiusKm ** 2 * rad(box.east - box.west) * (Math.sin(rad(box.north)) - Math.sin(rad(box.south)))
}

/** Craters per million km², the usual unit of crater density. */
export const density = (count: number, areaKm2: number) => (count / areaKm2) * 1e6

/** Two seeded boxes of 20° by 20° within the mid-latitudes, for comparing densities; same seed, same boxes. */
export function task(seed: number): [Box, Box] {
  const random = seeded(seed)
  const box = (): Box => {
    const south = -50 + Math.round(random() * 80)
    const west = -180 + Math.round(random() * 320)
    return { south, north: south + 20, west, east: west + 20 }
  }
  return [box(), box()]
}

export const COUNT_TOLERANCE = 0.1
