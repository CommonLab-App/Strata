import { describe, expect, it } from 'vitest'
import periods from '@data/timescale/periods.json'
import { ageFromRatio, ageOk, intervalAt, ISOTOPES, ratioAfter, remaining, samples } from './index'

describe('radiometric dating', () => {
  it('halves the parent every half-life and inverts the ratio', () => {
    expect(remaining(5730, 5730)).toBeCloseTo(0.5)
    expect(remaining(2 * 5730, 5730)).toBeCloseTo(0.25)
    expect(ratioAfter(5730, 5730)).toBeCloseTo(1)
    expect(ratioAfter(2 * 5730, 5730)).toBeCloseTo(3)
    for (const t of [1000, 1e6, 3e9]) expect(ageFromRatio(ratioAfter(t, 1.25e9), 1.25e9)).toBeCloseTo(t, -2)
  })
  it('makes reproducible samples whose true ages pass the checker and sit in their system’s range', () => {
    const a = samples(5)
    expect(samples(5)).toEqual(a)
    for (const s of a) {
      expect(ageOk(s, s.years)).toBe(true)
      expect(ageOk(s, s.years * 1.2)).toBe(false)
      const iso = ISOTOPES.find((x) => x.id === s.isotope)!
      expect(s.years).toBeGreaterThanOrEqual(iso.range[0])
      expect(s.years).toBeLessThanOrEqual(iso.range[1])
    }
  })
  it('places ages on the bundled time scale', () => {
    expect(intervalAt(periods, 100)?.name).toBe('Cretaceous')
    expect(intervalAt(periods, 0.01)?.name).toBe('Quaternary')
    expect(intervalAt(periods, 3000)).toBeNull()
  })
})
