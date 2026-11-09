import { z } from 'zod'
import { distanceKm, type LatLon } from '../geo'
import { distanceFromSP, EPICENTRE_TOLERANCE_KM, locateEpicentre, PICK_TOLERANCE_S, type TravelTimeRow } from './locate'

const pickSchema = z.object({ p: z.number().nullable(), s: z.number().nullable() })
/** The week-9 worksheet as the week stores it; picks are seconds from each record's first sample, keyed by net.sta. */
export const epicentreWorksheetSchema = z.object({
  event: z.string(),
  picks: z.record(z.string(), pickSchema),
  epicentre: z.object({ lat: z.number(), lon: z.number() }).nullable(),
  checked: z.boolean(),
  score: z.number().int().nullable(),
})
export type EpicentreWorksheet = z.infer<typeof epicentreWorksheetSchema>
export const EMPTY_EPICENTRE = (event: string): EpicentreWorksheet => ({ event, picks: {}, epicentre: null, checked: false, score: null })
export const EPICENTRE_MARKS = 2

export interface StationForLab extends LatLon {
  key: string
  refP: number
  refS: number
}

export interface StationDistances {
  key: string
  sp: number
  km: number
}

/** Each station's S minus P and the distance the table gives it; null until both picks exist. */
export function stationDistances(ws: EpicentreWorksheet, stations: readonly StationForLab[], table: readonly TravelTimeRow[]): (StationDistances | null)[] {
  return stations.map((s) => {
    const pick = ws.picks[s.key]
    if (!pick || pick.p === null || pick.s === null || pick.s <= pick.p) return null
    const sp = pick.s - pick.p
    return { key: s.key, sp, km: distanceFromSP(table, sp) }
  })
}

export interface EpicentreResult {
  /** Least-squares point from the learner's own distances. */
  expected: LatLon
  pointOk: boolean
  picksOk: boolean
  /** Learner's point to the catalogue epicentre, km. */
  missKm: number
  score: number
}

/**
 * Scores the sheet: one mark for a point within 50 km of the least-squares epicentre of the learner's own distances
 * (so a consistent set of picks earns it even if the picks are off), one for every pick within 2 s of the reference.
 */
export function scoreEpicentre(ws: EpicentreWorksheet, stations: readonly StationForLab[], catalogue: LatLon, table: readonly TravelTimeRow[]): EpicentreResult | null {
  const distances = stationDistances(ws, stations, table)
  if (ws.epicentre === null || distances.some((d) => d === null)) return null
  const expected = locateEpicentre(stations.map((s, i) => ({ lat: s.lat, lon: s.lon, km: distances[i]!.km })))
  const pointOk = distanceKm(ws.epicentre, expected) <= EPICENTRE_TOLERANCE_KM
  const picksOk = stations.every((s) => {
    const pick = ws.picks[s.key]
    return pick !== undefined && pick.p !== null && pick.s !== null && Math.abs(pick.p - s.refP) <= PICK_TOLERANCE_S && Math.abs(pick.s - s.refS) <= PICK_TOLERANCE_S
  })
  return { expected, pointOk, picksOk, missKm: distanceKm(ws.epicentre, catalogue), score: Number(pointOk) + Number(picksOk) }
}
