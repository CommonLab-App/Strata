import { describe, expect, it } from 'vitest'
import { azimuthDeg, destination, distanceKm } from './index'

describe('geo', () => {
  it('measures a quarter of the equator', () => {
    expect(distanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 90 })).toBeCloseTo((Math.PI / 2) * 6371, 3)
  })
  it('destination inverts distance and crosses the antimeridian cleanly', () => {
    const p = destination({ lat: 10, lon: 179 }, 90, 300)
    expect(p.lon).toBeLessThan(-178)
    expect(distanceKm({ lat: 10, lon: 179 }, p)).toBeCloseTo(300, 6)
  })
  it('azimuth is compass style', () => {
    expect(azimuthDeg(0, 1)).toBe(0)
    expect(azimuthDeg(1, 0)).toBe(90)
    expect(azimuthDeg(0, -1)).toBe(180)
    expect(azimuthDeg(-1, 0)).toBe(270)
  })
})
