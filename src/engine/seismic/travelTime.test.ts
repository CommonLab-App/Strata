import { describe, expect, it } from 'vitest'
import { distanceFromSP } from './locate'
import { predictedArrivals, TRAVEL_TIME_TABLE } from './travelTime'

describe('two-layer travel-time table', () => {
  it('has S minus P growing with distance and near 100 s at 1000 km', () => {
    const sp = TRAVEL_TIME_TABLE.map((r) => r.s - r.p)
    for (let i = 1; i < sp.length; i++) expect(sp[i]).toBeGreaterThan(sp[i - 1]!)
    const { p, s } = predictedArrivals(1000)
    expect(s - p).toBeGreaterThan(90)
    expect(s - p).toBeLessThan(115)
  })
  it('inverts: the distance from an S minus P is the distance it was predicted for', () => {
    for (const km of [250, 600, 1200]) {
      const { p, s } = predictedArrivals(km)
      expect(Math.abs(distanceFromSP(TRAVEL_TIME_TABLE, s - p) - km)).toBeLessThan(1)
    }
  })
})
