import { azimuthDeg } from '../geo'

/** A station velocity as the GNSS snapshot stores it: east and north components in mm/yr. */
export interface Velocity {
  ve: number
  vn: number
}

export interface RelativeMotion {
  east: number
  north: number
  /** mm/yr */
  speed: number
  /** degrees from north, 0 to 360 */
  azimuth: number
}

/** Motion of B as seen from A: B minus A. */
export function relativeMotion(a: Velocity, b: Velocity): RelativeMotion {
  const east = b.ve - a.ve
  const north = b.vn - a.vn
  return { east, north, speed: Math.hypot(east, north), azimuth: azimuthDeg(east, north) }
}

export type BoundaryKind = 'divergent' | 'convergent' | 'transform'

/** Bird (2003) PB2002 step classes folded to the three textbook kinds. */
export const BOUNDARY_KIND: Readonly<Record<string, BoundaryKind>> = {
  OSR: 'divergent',
  CRB: 'divergent',
  OTF: 'transform',
  CTF: 'transform',
  SUB: 'convergent',
  OCB: 'convergent',
  CCB: 'convergent',
}

/** Smallest unsigned difference between two bearings, 0 to 180. */
export const angleBetween = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360) + 360) % 360
  return d > 180 ? 360 - d : d
}

export interface MotionTolerance {
  /** Fraction of the expected speed, e.g. 0.1. */
  relative: number
  /** Floor in mm/yr so slow pairs are not impossible. */
  mmPerYear: number
  degrees: number
}

export const MOTION_TOLERANCE: MotionTolerance = { relative: 0.1, mmPerYear: 1, degrees: 10 }

/** Scores a learner's speed and azimuth against the recomputed motion. */
export function scoreMotion(expected: RelativeMotion, speed: number, azimuth: number, tol = MOTION_TOLERANCE) {
  const speedOk = Math.abs(speed - expected.speed) <= Math.max(tol.relative * expected.speed, tol.mmPerYear)
  const azimuthOk = angleBetween(azimuth, expected.azimuth) <= tol.degrees
  return { speedOk, azimuthOk }
}
