import type { TravelTimeRow } from './locate'

/**
 * A two-layer teaching Earth for regional distances: a crust over a mantle half-space, surface focus. The first
 * arrival is the direct wave or the head wave along the top of the mantle, whichever is earlier. The S minus P it
 * gives (about 100 s at 1000 km) matches the classic lab charts to within a few seconds.
 * ponytail: the reviewers may swap in a sampled iasp91 or ak135 table; `distanceFromSP` reads only the rows.
 * Mirrored in scripts/fetch-waveforms.mjs for the bundled reference picks.
 */
export const TWO_LAYER = { crustKm: 35, vp: 6.1, vs: 3.5, vpn: 8.0, vsn: 4.5 } as const

const firstArrival = (km: number, v: number, vn: number) => Math.min(km / v, km / vn + 2 * TWO_LAYER.crustKm * Math.sqrt(1 / v ** 2 - 1 / vn ** 2))

/** P and S first-arrival times in seconds after the origin at a distance. */
export const predictedArrivals = (km: number) => ({ p: firstArrival(km, TWO_LAYER.vp, TWO_LAYER.vpn), s: firstArrival(km, TWO_LAYER.vs, TWO_LAYER.vsn) })

/** The table the lab reads, 0 to 2000 km in 25 km steps. */
export const TRAVEL_TIME_TABLE: TravelTimeRow[] = Array.from({ length: 81 }, (_, i) => {
  const km = i * 25
  const { p, s } = predictedArrivals(km)
  return { km, p, s }
})
