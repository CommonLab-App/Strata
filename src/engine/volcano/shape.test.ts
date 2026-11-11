import { describe, expect, it } from 'vitest'
import { height, profile, SLOPE_DEG, type VolcanoType } from './shape'

const TYPES: VolcanoType[] = ['shield', 'strato', 'cinder', 'caldera']
const meanSlopeDeg = (type: VolcanoType) => {
  const p = profile(type)
  return (Math.atan(height(type) / (p[0]! - p[p.length - 1]!)) * 180) / Math.PI
}

describe('volcano profile', () => {
  it('has n radii from 1 at the base, never growing with height', () => {
    for (const type of TYPES) {
      for (const n of [24, 48, 7]) {
        const p = profile(type, n)
        expect(p).toHaveLength(n)
        expect(p[0]).toBe(1)
        for (let i = 1; i < n; i++) expect(p[i]!).toBeLessThanOrEqual(p[i - 1]! + 1e-12)
      }
    }
  })
  it('keeps the shield broad and the cinder cone pointed', () => {
    expect(profile('shield').at(-1)).toBeGreaterThan(0.3)
    expect(profile('cinder').at(-1)).toBeLessThan(0.15)
  })
  it('gives the caldera a flat top', () => {
    const top = profile('caldera').slice(-6)
    for (const r of top) expect(r).toBeCloseTo(top[0]!, 12)
    expect(top[0]).toBeGreaterThan(0.3)
  })
  it('recovers the flank slope from the arrays', () => {
    expect(Math.abs(meanSlopeDeg('shield') - SLOPE_DEG.shield)).toBeLessThan(3)
    expect(Math.abs(meanSlopeDeg('cinder') - SLOPE_DEG.cinder)).toBeLessThan(3)
  })
  it('orders the heights as a textbook does', () => {
    expect(height('shield')).toBeLessThan(height('caldera'))
    expect(height('caldera')).toBeLessThan(height('strato'))
    expect(height('strato')).toBeLessThan(height('cinder'))
  })
})
