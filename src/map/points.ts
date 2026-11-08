import type { Quake } from '@/data/adapters/usgs-quakes'
import type { MapPoint } from './types'

/** A quake as a dot: scaled by magnitude, never smaller than a tap can find. */
export const quakePoint = (quake: Quake): MapPoint => ({
  id: quake.id,
  lat: quake.lat,
  lon: quake.lon,
  time: Date.parse(quake.time),
  size: Math.max(4, 2 + (quake.mag ?? 0) * 2),
})

/** `count` points spread over the globe, the same for the same seed, for the frame-rate bench. */
export function syntheticPoints(count: number, seed: number): MapPoint[] {
  // ponytail: mulberry32, enough for a scatter.
  let s = seed >>> 0
  const random = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const points: MapPoint[] = []
  for (let i = 0; i < count; i++) {
    // Uniform on the sphere: latitude from arcsin, not a flat spread, so the poles are not crowded.
    const lat = (Math.asin(random() * 2 - 1) * 180) / Math.PI
    points.push({ id: `synthetic-${i}`, lat, lon: random() * 360 - 180, time: i, size: 3 + random() * 6 })
  }
  return points
}
