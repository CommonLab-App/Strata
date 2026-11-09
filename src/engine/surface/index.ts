import type { Grid } from '../topo'

/**
 * The Surface Sandbox models for week 15.
 *
 * Glacier: a valley cross-profile z(x) starts V-shaped and is reshaped under ice. The glacier is taken to carve its
 * bed toward a parabolic trough spanning the valley at the ice surface, widening the walls first and then deepening
 * the floor as the trough's depth grows with time: D = ice × 1.6 × (1 − e^(−rate·years)). The bed is lowered to the
 * trough wherever the trough lies below it. The shape is summarised by the exponent b of z = a·|x|^b through the
 * quarter- and half-relief widths: 1 is a V, 2 a parabola.
 * ponytail: a teaching model, not a glaciological one; the reviewers may replace `glaciate`.
 */
export const PROFILE_HALF_WIDTH = 2000
export const PROFILE_POINTS = 81
/** Default pace of trough deepening, per year: about two thirds of the way in 3000 years. */
export const GLACIER_RATE = 3e-4

export const vValley = (depth: number): number[] => Array.from({ length: PROFILE_POINTS }, (_, i) => depth * Math.abs((i / (PROFILE_POINTS - 1)) * 2 - 1))

const xOf = (i: number) => (i / (PROFILE_POINTS - 1)) * 2 * PROFILE_HALF_WIDTH - PROFILE_HALF_WIDTH

/** The profile after `years` under ice whose surface stands `iceSurface` metres above the original floor datum. */
export function glaciate(profile: readonly number[], iceSurface: number, years: number, rate = GLACIER_RATE): number[] {
  if (iceSurface <= 0 || years <= 0) return [...profile]
  const halfWidth = widthAtLevel(profile, iceSurface) / 2
  if (halfWidth <= 0) return [...profile]
  const depth = iceSurface * 1.6 * (1 - Math.exp(-rate * years))
  return profile.map((z, i) => {
    const x = xOf(i)
    if (Math.abs(x) > halfWidth) return z
    const trough = iceSurface - depth + depth * (x / halfWidth) ** 2
    return Math.min(z, trough)
  })
}

/** Width of the profile at an absolute level, by the outermost crossings either side of the lowest point. */
function widthAtLevel(profile: readonly number[], level: number): number {
  const dx = (2 * PROFILE_HALF_WIDTH) / (PROFILE_POINTS - 1)
  const low = profile.indexOf(Math.min(...profile))
  const cross = (from: number, to: number, step: number) => {
    for (let i = from; i !== to; i += step) {
      const a = profile[i]!
      const b = profile[i + step]!
      if ((a - level) * (b - level) <= 0 && a !== b) return (i + ((level - a) / (b - a)) * step) * dx - PROFILE_HALF_WIDTH
    }
    return step > 0 ? PROFILE_HALF_WIDTH : -PROFILE_HALF_WIDTH
  }
  return cross(low, PROFILE_POINTS - 1, 1) - cross(low, 0, -1)
}

/** Width of the valley at a given height above its lowest point. */
export const widthAt = (profile: readonly number[], heightAboveFloor: number): number => widthAtLevel(profile, Math.min(...profile) + heightAboveFloor)

/** Shape exponent b of z = a·|x|^b from the widths at a quarter and half of the relief; 1 is a V, 2 a U. */
export function shapeExponent(profile: readonly number[]): number {
  const relief = Math.max(...profile) - Math.min(...profile)
  const w1 = widthAt(profile, relief / 4)
  const w2 = widthAt(profile, relief / 2)
  if (w1 <= 0 || w2 <= w1) return 1
  return Math.log(2) / Math.log(w2 / w1)
}

/** Fraction of a grid at or below `level` metres: the sea-level task. */
export function floodedFraction(grid: Grid, level: number): number {
  let n = 0
  for (const row of grid.heights) for (const h of row) if (h <= level) n++
  return n / (grid.size * grid.size)
}

export const SURFACE_TOLERANCE = { floodedFraction: 0.05 }
