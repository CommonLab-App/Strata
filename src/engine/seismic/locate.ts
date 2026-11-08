import { destination, distanceKm, type LatLon } from '../geo'

/** One row of a travel-time table for a surface focus: distance and the P and S arrival times after the origin. */
export interface TravelTimeRow {
  km: number
  p: number
  s: number
}

/** Distance from an S minus P time, by linear interpolation in the table (sorted by km); clamps at the table's ends. */
export function distanceFromSP(table: readonly TravelTimeRow[], sp: number): number {
  const first = table[0]
  const last = table[table.length - 1]
  if (!first || !last) throw new Error('empty travel-time table')
  if (sp <= first.s - first.p) return first.km
  if (sp >= last.s - last.p) return last.km
  for (let i = 1; i < table.length; i++) {
    const a = table[i - 1]!
    const b = table[i]!
    const spA = a.s - a.p
    const spB = b.s - b.p
    if (sp >= spA && sp <= spB) return spB === spA ? a.km : a.km + ((sp - spA) / (spB - spA)) * (b.km - a.km)
  }
  return last.km
}

export interface StationDistance extends LatLon {
  km: number
}

/**
 * Least-squares epicentre: the point minimising the sum of squared differences between its great-circle distance to each
 * station and that station's distance. Gauss-Newton in a local east-north frame, from the centroid of the circles'
 * nearest points. Deterministic; converges in a handful of steps for teaching cases.
 */
export function locateEpicentre(stations: readonly StationDistance[], iterations = 25): LatLon {
  if (stations.length < 3) throw new Error('need three stations')
  let p = startPoint(stations)
  const h = 0.5 // km step for the numeric Jacobian
  for (let n = 0; n < iterations; n++) {
    const r = stations.map((s) => distanceKm(p, s) - s.km)
    const east = destination(p, 90, h)
    const north = destination(p, 0, h)
    const je = stations.map((s, i) => (distanceKm(east, s) - s.km - r[i]!) / h)
    const jn = stations.map((s, i) => (distanceKm(north, s) - s.km - r[i]!) / h)
    // Normal equations for two unknowns.
    let aee = 0
    let aen = 0
    let ann = 0
    let be = 0
    let bn = 0
    for (let i = 0; i < stations.length; i++) {
      aee += je[i]! * je[i]!
      aen += je[i]! * jn[i]!
      ann += jn[i]! * jn[i]!
      be -= je[i]! * r[i]!
      bn -= jn[i]! * r[i]!
    }
    const det = aee * ann - aen * aen
    if (Math.abs(det) < 1e-12) break
    const de = (be * ann - bn * aen) / det
    const dn = (aee * bn - aen * be) / det
    const step = Math.hypot(de, dn)
    if (step < 1e-3) break
    p = destination(p, (Math.atan2(de, dn) * 180) / Math.PI, step)
  }
  return p
}

/** Mean of the points each circle would put nearest the others' centroid: a start inside the triangle of circles. */
function startPoint(stations: readonly StationDistance[]): LatLon {
  const centroid = mean(stations)
  return mean(
    stations.map((s) => {
      const d = distanceKm(s, centroid)
      if (d < 1e-6) return centroid
      const toward = destination(s, bearing(s, centroid), s.km)
      return toward
    }),
  )
}

const mean = (pts: readonly LatLon[]): LatLon => ({
  lat: pts.reduce((t, p) => t + p.lat, 0) / pts.length,
  lon: pts.reduce((t, p) => t + p.lon, 0) / pts.length,
})

function bearing(a: LatLon, b: LatLon): number {
  const rad = Math.PI / 180
  const dLon = (b.lon - a.lon) * rad
  const y = Math.sin(dLon) * Math.cos(b.lat * rad)
  const x = Math.cos(a.lat * rad) * Math.sin(b.lat * rad) - Math.sin(a.lat * rad) * Math.cos(b.lat * rad) * Math.cos(dLon)
  return ((Math.atan2(y, x) / rad) + 360) % 360
}

export const EPICENTRE_TOLERANCE_KM = 50
export const PICK_TOLERANCE_S = 2
