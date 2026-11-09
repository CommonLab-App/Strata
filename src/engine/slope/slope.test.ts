import { describe, expect, it } from 'vitest'
import { factorOfSafety, failureAngle, SOILS, task } from './index'

const sand = SOILS[0]!

describe('infinite slope', () => {
  it('fails dry cohesionless sand at its friction angle', () => {
    expect(failureAngle(sand, 0, 0)).toBeCloseTo(32, 0)
    expect(factorOfSafety(sand, { angle: 20, saturation: 0, rootCohesion: 0 })).toBeGreaterThan(1)
  })
  it('weakens with water and strengthens with roots', () => {
    const dry = failureAngle(sand, 0, 0)
    const wet = failureAngle(sand, 1, 0)
    expect(wet).toBeLessThan(dry)
    expect(failureAngle(sand, 1, 5)).toBeGreaterThan(wet)
  })
  it('makes reproducible tasks', () => {
    expect(task(4)).toEqual(task(4))
    expect(task(4).settings).toHaveLength(3)
  })
})
