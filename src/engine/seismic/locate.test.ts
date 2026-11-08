import { describe, expect, it } from 'vitest'
import { destination, distanceKm } from '../geo'
import { distanceFromSP, locateEpicentre, type TravelTimeRow } from './locate'

// A synthetic table: P at 6 km/s, S at 3.5 km/s, so S−P = km / 8.4.
const table: TravelTimeRow[] = [100, 200, 400, 800, 1600].map((km) => ({ km, p: km / 6, s: km / 3.5 }))

describe('distanceFromSP', () => {
  it('interpolates between rows and clamps at the ends', () => {
    expect(distanceFromSP(table, 300 / 8.4)).toBeCloseTo(300, 6)
    expect(distanceFromSP(table, 1000 / 8.4)).toBeCloseTo(1000, 6)
    expect(distanceFromSP(table, 0)).toBe(100)
    expect(distanceFromSP(table, 1e6)).toBe(1600)
  })
})

describe('locateEpicentre', () => {
  const truth = { lat: 37.2, lon: -118.4 }
  const stations = [
    { ...destination(truth, 30, 420), km: 420 },
    { ...destination(truth, 150, 610), km: 610 },
    { ...destination(truth, 265, 880), km: 880 },
  ]
  it('recovers a known epicentre from exact distances', () => {
    const p = locateEpicentre(stations)
    expect(distanceKm(p, truth)).toBeLessThan(0.5)
  })
  it('lands within the lab tolerance when the distances carry a few percent of error', () => {
    const noisy = stations.map((s, i) => ({ ...s, km: s.km * [1.03, 0.97, 1.02][i]! }))
    expect(distanceKm(locateEpicentre(noisy), truth)).toBeLessThan(50)
  })
  it('is deterministic', () => {
    expect(locateEpicentre(stations)).toEqual(locateEpicentre(stations))
  })
})
