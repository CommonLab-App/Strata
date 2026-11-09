import { distanceKm, type LatLon } from '../geo'
import type { BoundaryKind } from './motion'

/** One bundled PB2002 line: kind and [lon, lat] vertices. */
export interface BoundaryLine {
  kind: BoundaryKind
  coordinates: [number, number][]
}

export interface NearestBoundary {
  kind: BoundaryKind
  km: number
}

/**
 * The nearest boundary to a point, or null beyond maxKm.
 * ponytail: vertex distance only; PB2002 steps are 30 to 60 km apart, so the miss is under 30 km against a 200 km test.
 * Upgrade to point-to-segment distance if a checker ever needs better.
 */
export function nearestBoundary(point: LatLon, lines: readonly BoundaryLine[], maxKm = 200): NearestBoundary | null {
  let best: NearestBoundary | null = null
  for (const line of lines) {
    for (const [lon, lat] of line.coordinates) {
      const km = distanceKm(point, { lat, lon })
      if (km <= maxKm && (best === null || km < best.km)) best = { kind: line.kind, km }
    }
  }
  return best
}

export const midpoint = (a: LatLon, b: LatLon): LatLon => ({ lat: (a.lat + b.lat) / 2, lon: Math.abs(a.lon - b.lon) > 180 ? ((a.lon + b.lon + 360) / 2 + 540) % 360 - 180 : (a.lon + b.lon) / 2 })

/** The checker's rule: the learner's kind matches the nearest boundary within maxKm, or they said none and there is none. */
export function boundaryAnswerOk(mid: LatLon, lines: readonly BoundaryLine[], answer: BoundaryKind | 'none', maxKm = 200): boolean {
  const near = nearestBoundary(mid, lines, maxKm)
  return near === null ? answer === 'none' : answer === near.kind
}
