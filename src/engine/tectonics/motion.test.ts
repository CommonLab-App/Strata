import { describe, expect, it } from 'vitest'
import { BOUNDARY_KIND, angleBetween, relativeMotion, scoreMotion } from './motion'

describe('relativeMotion', () => {
  it('is B minus A with a compass azimuth', () => {
    const m = relativeMotion({ ve: -10, vn: 5 }, { ve: 20, vn: 5 })
    expect(m).toEqual({ east: 30, north: 0, speed: 30, azimuth: 90 })
    expect(relativeMotion({ ve: 0, vn: 0 }, { ve: -3, vn: -3 }).azimuth).toBeCloseTo(225)
  })
  it('scores within 10 % or 1 mm/yr and 10 degrees', () => {
    const m = relativeMotion({ ve: 0, vn: 0 }, { ve: 0, vn: 40 })
    expect(scoreMotion(m, 43, 8)).toEqual({ speedOk: true, azimuthOk: true })
    expect(scoreMotion(m, 45, 0)).toEqual({ speedOk: false, azimuthOk: true })
    expect(scoreMotion(m, 40, 349)).toEqual({ speedOk: true, azimuthOk: false })
    const slow = relativeMotion({ ve: 0, vn: 0 }, { ve: 2, vn: 0 })
    expect(scoreMotion(slow, 2.9, 90).speedOk).toBe(true)
  })
  it('wraps angles across north', () => {
    expect(angleBetween(355, 5)).toBe(10)
    expect(angleBetween(5, 355)).toBe(10)
  })
  it('folds every PB2002 step class to a textbook kind', () => {
    expect(new Set(Object.values(BOUNDARY_KIND))).toEqual(new Set(['divergent', 'convergent', 'transform']))
    expect(Object.keys(BOUNDARY_KIND).sort()).toEqual(['CCB', 'CRB', 'CTF', 'OCB', 'OSR', 'OTF', 'SUB'])
  })
})
