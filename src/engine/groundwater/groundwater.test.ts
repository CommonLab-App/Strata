import { describe, expect, it } from 'vitest'
import { sample } from '../topo'
import { azimuthDifference, darcy, flowAzimuth, headContours, task, thiemDrawdown, waterTable } from './index'

describe('groundwater', () => {
  it('computes Darcy and Thiem', () => {
    expect(darcy(10, 100, 0.01)).toBe(10)
    expect(thiemDrawdown(500, 100, 500, 50)).toBeCloseTo((500 * Math.log(10)) / (2 * Math.PI * 100))
  })
  it('interpolates a plane of wells and finds flow down the slope', () => {
    // Head falls to the east at 0.01: flow is toward the east (azimuth 90).
    const wells = [0, 500, 1000, 1500, 2000].flatMap((x) => [0, 1000, 2000].map((y) => ({ x, y, head: 120 - 0.01 * x })))
    const grid = waterTable(wells, 2000, 32)
    expect(sample(grid, 16, 16)).toBeCloseTo(120 - 0.01 * 1031, 0)
    expect(azimuthDifference(flowAzimuth(grid, 750, 500), 90)).toBeLessThan(5)
    const contours = headContours(grid, 5)
    expect(contours.length).toBeGreaterThan(2)
  })
  it('makes reproducible tasks', () => {
    expect(task(3)).toEqual(task(3))
    expect(task(3).wells).toHaveLength(8)
  })
})
