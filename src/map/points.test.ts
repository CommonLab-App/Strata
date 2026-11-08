import { describe, expect, it } from 'vitest'
import { syntheticPoints, quakePoint } from './points'
import { inRange, zoomToHeight } from './types'

describe('map points', () => {
  it('makes the same synthetic scatter for the same seed, within bounds', () => {
    const a = syntheticPoints(10_000, 1)
    expect(a).toEqual(syntheticPoints(10_000, 1))
    expect(a).not.toEqual(syntheticPoints(10_000, 2))
    expect(a).toHaveLength(10_000)
    for (const p of a) {
      expect(Math.abs(p.lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(p.lon)).toBeLessThanOrEqual(180)
    }
  })

  it('sizes a quake by magnitude with a floor a finger can find', () => {
    const base = { id: 'q', time: '2026-01-01T00:00:00.000Z', lat: 1, lon: 2, depth_km: 10, place: null, url: 'u' }
    expect(quakePoint({ ...base, mag: null }).size).toBe(4)
    expect(quakePoint({ ...base, mag: 0.5 }).size).toBe(4)
    expect(quakePoint({ ...base, mag: 6 }).size).toBe(14)
    expect(quakePoint({ ...base, mag: 6 }).time).toBe(Date.parse(base.time))
  })

  it('filters by time, and treats null as everything', () => {
    const p = { id: 'p', lat: 0, lon: 0, time: 50, size: 1 }
    expect(inRange(p, null)).toBe(true)
    expect(inRange(p, { start: 0, end: 50 })).toBe(true)
    expect(inRange(p, { start: 51, end: 100 })).toBe(false)
  })

  it('maps zoom 0 to a height that shows the whole globe', () => {
    expect(zoomToHeight(0)).toBe(40_000_000)
    expect(zoomToHeight(2)).toBe(10_000_000)
  })
})
