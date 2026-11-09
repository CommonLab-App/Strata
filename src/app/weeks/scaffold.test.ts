import { describe, expect, it } from 'vitest'
import { DRAFT, WEEKS } from '@/app/weeks'
import { PLANS } from './scaffold'

describe('week scaffolds', () => {
  it('cover exactly the draft weeks, each with reading and sources over https', () => {
    // Plans outlive their drafts: a built week keeps its plan entry for the record, so drafts are a subset.
    for (const week of DRAFT) expect(PLANS[week]).toBeDefined()
    for (const plan of Object.values(PLANS)) {
      expect(plan.reading.length).toBeGreaterThan(0)
      expect(plan.sources.length).toBeGreaterThan(0)
      for (const { href } of [...plan.reading, ...plan.sources]) expect(href).toMatch(/^https:\/\//)
    }
  })
  it('leave no week without a page', () => {
    const built = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect([...built, ...DRAFT].sort((a, b) => a - b)).toEqual(WEEKS.map((w) => w.week))
  })
})
