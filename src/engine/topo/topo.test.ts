import { describe, expect, it } from 'vitest'
import { contour, gradient, levels, profile, sample, strikeDifference, task, threePoint, type Grid } from './index'

const cone: Grid = {
  size: 21,
  dx: 100,
  dy: 100,
  heights: Array.from({ length: 21 }, (_, r) => Array.from({ length: 21 }, (_, c) => Math.round(1000 - 40 * Math.hypot(c - 10, r - 10)))),
}

describe('topo engine', () => {
  it('samples bilinearly and profiles a cone', () => {
    expect(sample(cone, 10, 10)).toBe(1000)
    expect(sample(cone, 10.5, 10)).toBeCloseTo(980, 0)
    const p = profile(cone, [0, 10], [20, 10], 5)
    expect(p.map((s) => Math.round(s.elevation))).toEqual([600, 800, 1000, 800, 600])
    expect(p[4]!.metres).toBeCloseTo(2000)
    expect(gradient(cone, [0, 10], [10, 10])).toBeCloseTo(400, 0)
  })
  it('draws closed contours around the peak', () => {
    const lines = contour(cone, 900)
    expect(lines.length).toBe(1)
    expect(lines[0]!.length).toBeGreaterThan(8)
    expect(levels(cone, 100)).toEqual([500, 600, 700, 800, 900, 1000])
  })
  it('solves the three-point problem with the right-hand rule', () => {
    // A plane dipping 30° toward the east: strike north (0°), dip 30°.
    const t = Math.tan(Math.PI / 6)
    const { strike, dip } = threePoint([[0, 0, 500], [100, 0, 500 - 100 * t], [0, 100, 500]])
    expect(dip).toBeCloseTo(30)
    expect(strikeDifference(strike, 0)).toBeLessThan(0.01)
    expect(strike).toBeCloseTo(0)
    const south = threePoint([[0, 0, 500], [100, 0, 500], [0, -100, 500 - 100 * t]])
    expect(south.strike).toBeCloseTo(90)
  })
  it('generates tasks whose outcrops solve back to the chosen plane', () => {
    for (const seed of [1, 7, 99]) {
      const t = task(seed, 3)
      const solved = threePoint(t.outcrops)
      expect(Math.abs(solved.dip - t.truth.dip)).toBeLessThan(1.5)
      expect(strikeDifference(solved.strike, t.truth.strike)).toBeLessThan(3)
    }
  })
})
