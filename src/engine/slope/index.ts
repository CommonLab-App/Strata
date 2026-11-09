import { seeded } from '../random'

/**
 * Infinite-slope stability for week 16. Factor of safety of a planar slide of thickness z on a slope of angle β:
 *   FS = (c' + cr + (γ − m·γw)·z·cos²β·tanφ') / (γ·z·sinβ·cosβ)
 * with soil cohesion c', root cohesion cr (kPa), unit weight γ (kN/m³), water unit weight γw = 9.81, saturation
 * fraction m (height of the water table above the slip surface over z), and friction angle φ'. The textbook form,
 * as in most intro lab manuals; the reviewers set the soil parameters.
 */
export interface SlopeInput {
  /** degrees */
  angle: number
  /** 0 dry to 1 fully saturated */
  saturation: number
  /** kPa added by roots */
  rootCohesion: number
}

export interface Soil {
  name: string
  /** kPa */
  cohesion: number
  /** degrees */
  friction: number
  /** kN/m³ */
  unitWeight: number
  /** m */
  thickness: number
}

export const GAMMA_W = 9.81

export const SOILS: Soil[] = [
  { name: 'loose sand', cohesion: 0, friction: 32, unitWeight: 17, thickness: 2 },
  { name: 'silty soil', cohesion: 5, friction: 28, unitWeight: 18, thickness: 2 },
  { name: 'clay-rich soil', cohesion: 12, friction: 20, unitWeight: 19, thickness: 2 },
]

const rad = (d: number) => (d * Math.PI) / 180

export function factorOfSafety(soil: Soil, { angle, saturation, rootCohesion }: SlopeInput): number {
  const b = rad(angle)
  const resisting = soil.cohesion + rootCohesion + (soil.unitWeight - saturation * GAMMA_W) * soil.thickness * Math.cos(b) ** 2 * Math.tan(rad(soil.friction))
  const driving = soil.unitWeight * soil.thickness * Math.sin(b) * Math.cos(b)
  return driving <= 0 ? Infinity : resisting / driving
}

/** The slope angle at which FS falls to 1 for the given water and roots, by bisection; 90 if it never does. */
export function failureAngle(soil: Soil, saturation: number, rootCohesion: number): number {
  let lo = 0.1
  let hi = 89.9
  if (factorOfSafety(soil, { angle: hi, saturation, rootCohesion }) > 1) return 90
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (factorOfSafety(soil, { angle: mid, saturation, rootCohesion }) > 1) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export interface SlopeTask {
  soil: number
  settings: { saturation: number; rootCohesion: number }[]
}

/** Three seeded settings on one soil: dry and bare, wet and bare, wet with roots. */
export function task(seed: number): SlopeTask {
  const random = seeded(seed)
  const pick = (lo: number, hi: number, step: number) => lo + Math.round((random() * (hi - lo)) / step) * step
  const wet = pick(0.5, 1, 0.1)
  return { soil: Math.floor(random() * SOILS.length), settings: [{ saturation: 0, rootCohesion: 0 }, { saturation: wet, rootCohesion: 0 }, { saturation: wet, rootCohesion: pick(2, 10, 1) }] }
}

export const SLOPE_TOLERANCE_DEG = 2
