import { describe, expect, it } from 'vitest'
import { boxAreaKm2, countCraters, density, task } from './index'

describe('crater counting', () => {
  it('counts craters in a box above a threshold and measures the box', () => {
    const craters = [
      { lat: 5, lon: 5, diameter: 30 },
      { lat: 5, lon: 6, diameter: 10 },
      { lat: 50, lon: 5, diameter: 40 },
    ]
    const box = { south: 0, north: 10, west: 0, east: 10 }
    expect(countCraters(craters, box, 20)).toBe(1)
    expect(countCraters(craters, box, 5)).toBe(2)
    // A 10° box at the equator on a 1737 km sphere is about 92 000 km².
    expect(boxAreaKm2(box, 1737.4)).toBeCloseTo(91900, -3)
    expect(density(10, 1e6)).toBe(10)
  })
  it('makes reproducible boxes of twenty degrees', () => {
    const [a, b] = task(2)
    expect(task(2)).toEqual([a, b])
    expect(a.north - a.south).toBe(20)
    expect(b.east - b.west).toBe(20)
  })
})
