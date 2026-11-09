import { describe, expect, it } from 'vitest'
import { floodedFraction, glaciate, shapeExponent, vValley, widthAt } from './index'

describe('surface sandbox models', () => {
  it('reads a V as exponent 1 and rounds it toward a U under ice', () => {
    const v = vValley(500)
    expect(shapeExponent(v)).toBeCloseTo(1, 1)
    expect(widthAt(v, 250)).toBeCloseTo(2000, -1)
    const u = glaciate(v, 400, 10000)
    expect(Math.min(...u)).toBeLessThan(0)
    expect(shapeExponent(u)).toBeGreaterThan(1.8)
    expect(shapeExponent(glaciate(v, 400, 500))).toBeLessThan(1.3)
  })
  it('counts flooded cells', () => {
    const grid = { size: 2, dx: 1, dy: 1, heights: [[-5, 0], [1, 10]] }
    expect(floodedFraction(grid, 0)).toBe(0.5)
    expect(floodedFraction(grid, 1)).toBe(0.75)
  })
})
