import { seeded } from '../random'

/**
 * Radiometric dating for the week-11 lab. Ages in years. The decay law is exact; the "usable range" of each system
 * is the usual textbook span (roughly a tenth of a half-life to ten half-lives for the long-lived systems, and up to
 * about 50 000 years for carbon-14), which the reviewers may adjust.
 */
export interface Isotope {
  id: string
  parent: string
  daughter: string
  /** years */
  halfLife: number
  /** youngest and oldest ages the system dates well, years */
  range: [number, number]
}

export const ISOTOPES: Isotope[] = [
  { id: 'c14', parent: 'carbon-14', daughter: 'nitrogen-14', halfLife: 5730, range: [100, 50_000] },
  { id: 'k40', parent: 'potassium-40', daughter: 'argon-40', halfLife: 1.25e9, range: [100_000, 4.5e9] },
  { id: 'u238', parent: 'uranium-238', daughter: 'lead-206', halfLife: 4.468e9, range: [10_000_000, 4.6e9] },
  { id: 'rb87', parent: 'rubidium-87', daughter: 'strontium-87', halfLife: 4.88e10, range: [100_000_000, 4.6e9] },
]

/** Fraction of parent left after `years`. */
export const remaining = (years: number, halfLife: number) => 0.5 ** (years / halfLife)

/** Daughter-to-parent ratio after `years`, assuming no daughter at the start. */
export const ratioAfter = (years: number, halfLife: number) => 1 / remaining(years, halfLife) - 1

/** Age from a daughter-to-parent ratio: t = T · log2(1 + D/P). */
export const ageFromRatio = (daughterToParent: number, halfLife: number) => halfLife * Math.log2(1 + daughterToParent)

export const inRange = (isotope: Isotope, years: number) => years >= isotope.range[0] && years <= isotope.range[1]

export interface Sample {
  id: string
  isotope: string
  /** Measured daughter-to-parent ratio, rounded as a lab would report it. */
  ratio: number
  /** True age, kept for the checker. */
  years: number
}

/** Three samples spanning the systems, one each from carbon-14, potassium-argon and uranium-lead; same seed, same samples. */
export function samples(seed: number): Sample[] {
  const random = seeded(seed)
  const pickIn = (lo: number, hi: number) => lo * (hi / lo) ** random()
  const plan: [string, number, number][] = [
    ['c14', 2_000, 40_000],
    ['k40', 1e6, 2e9],
    ['u238', 1e8, 3.5e9],
  ]
  return plan.map(([isotope, lo, hi], i) => {
    const iso = ISOTOPES.find((x) => x.id === isotope)!
    const years = Math.round(pickIn(lo, hi))
    const ratio = Number(ratioAfter(years, iso.halfLife).toPrecision(3))
    return { id: `sample-${i + 1}`, isotope, ratio, years }
  })
}

export const AGE_TOLERANCE = 0.05

/** The learner's age against the age the ratio gives, within 5 %. Both sides use the reported (rounded) ratio. */
export function ageOk(sample: Sample, learnerYears: number): boolean {
  const iso = ISOTOPES.find((x) => x.id === sample.isotope)!
  const expected = ageFromRatio(sample.ratio, iso.halfLife)
  return Math.abs(learnerYears - expected) <= AGE_TOLERANCE * expected
}

export interface Interval {
  name: string
  startMa: number
  endMa: number
}

/** The interval an age in millions of years falls in; null before the oldest interval. */
export const intervalAt = (intervals: readonly Interval[], ma: number) => intervals.find((p) => ma >= p.endMa && ma < p.startMa) ?? null
