import { describe, expect, it } from 'vitest'
import { apply, emptySection, generate, scoreOrder, shuffled, surfaces } from './index'

describe('strata builder', () => {
  it('is deterministic for a seed and makes seven to twelve events', () => {
    for (const seed of [1, 2, 3, 42, 1000]) {
      const a = generate(seed)
      const b = generate(seed)
      expect(a.events).toEqual(b.events)
      expect(a.events.length).toBeGreaterThanOrEqual(5)
      expect(a.events.length).toBeLessThanOrEqual(13)
      expect(shuffled(a).map((e) => e.id).sort()).toEqual(a.events.map((e) => e.id).sort())
    }
  })
  it('lays beds flat, drops the left side at a fault, and planes the surface on erosion', () => {
    let s = apply(emptySection(7), { kind: 'bed', lithology: 0, thickness: 2 })
    expect(new Set(surfaces(s)).size).toBe(1)
    s = apply(s, { kind: 'fault', x: 24, drop: 1 })
    const tops = surfaces(s)
    expect(tops[0]).toBeCloseTo(tops[47]! - 1)
    s = apply(s, { kind: 'erosion' })
    expect(s.surfaces[0]?.type).toBe('disconformity')
    s = apply(s, { kind: 'bed', lithology: 1, thickness: 1 })
    expect(new Set(surfaces(s)).size).toBe(1)
  })
  it('calls an erosion after a tilt an angular unconformity', () => {
    let s = apply(emptySection(7), { kind: 'bed', lithology: 0, thickness: 2 })
    s = apply(s, { kind: 'tilt', slope: 0.1 })
    s = apply(s, { kind: 'erosion' })
    expect(s.surfaces[0]?.type).toBe('angular')
  })
  it('scores the true order perfectly and names the rule for the first wrong pair', () => {
    const s = generate(11)
    expect(scoreOrder(s, s.events.map((e) => e.id))).toEqual({ pairs: 1, broken: null })
    const reversed = [...s.events].reverse().map((e) => e.id)
    const score = scoreOrder(s, reversed)
    expect(score.pairs).toBe(0)
    expect(score.broken?.rule).toMatch(/./)
  })
})
