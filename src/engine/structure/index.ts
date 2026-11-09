import { seeded } from '../random'

/**
 * Structural geology for week 17: planes and lines on an equal-angle (Wulff) lower-hemisphere stereonet, poles,
 * and the intersection of two planes. Angles in degrees; strikes by the right-hand rule, trends from north.
 */
export interface Plane {
  strike: number
  dip: number
}
export interface Line {
  trend: number
  plunge: number
}

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const norm = (a: number) => ((a % 360) + 360) % 360

/** Unit vector of a line, x east, y north, z down (lower hemisphere positive). */
export const lineVector = ({ trend, plunge }: Line): [number, number, number] => [Math.cos(rad(plunge)) * Math.sin(rad(trend)), Math.cos(rad(plunge)) * Math.cos(rad(trend)), Math.sin(rad(plunge))]

/** Trend and plunge of a vector, flipped into the lower hemisphere. */
export function vectorLine([x, y, z]: [number, number, number]): Line {
  if (z < 0) [x, y, z] = [-x, -y, -z]
  const h = Math.hypot(x, y)
  return { trend: h < 1e-12 ? 0 : norm(deg(Math.atan2(x, y))), plunge: deg(Math.atan2(z, h)) }
}

/** The pole to a plane: a line normal to it. */
export const pole = ({ strike, dip }: Plane): Line => ({ trend: norm(strike + 270), plunge: 90 - dip })

/** The plane whose pole this is. */
export const planeOfPole = ({ trend, plunge }: Line): Plane => ({ strike: norm(trend + 90), dip: 90 - plunge })

/** Lines lying in a plane, from the strike direction round through the dip direction, as trend and plunge. */
export function greatCircle(plane: Plane, steps = 36): Line[] {
  const s = rad(plane.strike)
  const d = rad(plane.dip)
  const strikeDir: [number, number, number] = [Math.sin(s), Math.cos(s), 0]
  const dipDir: [number, number, number] = [Math.cos(s) * Math.cos(d), -Math.sin(s) * Math.cos(d), Math.sin(d)]
  const out: Line[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI
    out.push(vectorLine([strikeDir[0] * Math.cos(t) + dipDir[0] * Math.sin(t), strikeDir[1] * Math.cos(t) + dipDir[1] * Math.sin(t), strikeDir[2] * Math.cos(t) + dipDir[2] * Math.sin(t)]))
  }
  return out
}

/** Equal-angle projection of a line to the unit disc, x east, y north. */
export function project({ trend, plunge }: Line): [number, number] {
  const r = Math.tan(rad(45 - plunge / 2))
  return [r * Math.sin(rad(trend)), r * Math.cos(rad(trend))]
}

/** The line along which two planes meet: the cross product of their poles. */
export function intersection(a: Plane, b: Plane): Line {
  const [x1, y1, z1] = lineVector(pole(a))
  const [x2, y2, z2] = lineVector(pole(b))
  return vectorLine([y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2])
}

export const angleDifference = (a: number, b: number) => {
  const d = Math.abs(norm(a - b))
  return d > 180 ? 360 - d : d
}
/** Strike or trend difference allowing the two ends of a line. */
export const axisDifference = (a: number, b: number) => Math.min(angleDifference(a, b), angleDifference(a + 180, b))

export interface StructureTask {
  planes: [Plane, Plane]
}

/** Two seeded planes of different strike, as the two limbs of a fold. */
export function task(seed: number): StructureTask {
  const random = seeded(seed)
  const pick = (lo: number, hi: number, step: number) => lo + Math.round((random() * (hi - lo)) / step) * step
  const s1 = pick(0, 355, 5)
  return { planes: [{ strike: s1, dip: pick(15, 75, 5) }, { strike: norm(s1 + pick(40, 140, 5)), dip: pick(15, 75, 5) }] }
}

export const STRUCTURE_TOLERANCE_DEG = 6
