import { describe, expect, it } from 'vitest'
import { WEEKS, weekBySlug, weekPath } from './weeks'

describe('topic slugs', () => {
  it('are unique, url-safe, and route back to their week', () => {
    const slugs = WEEKS.map((w) => w.slug)
    expect(new Set(slugs).size).toBe(WEEKS.length)
    for (const w of WEEKS) {
      expect(w.slug).toMatch(/^[a-z0-9-]+$/)
      expect(weekBySlug(w.slug)).toBe(w)
      expect(weekPath(w.week)).toBe(`/topic/${w.slug}`)
    }
    expect(weekBySlug('week-8')).toBeUndefined()
  })
})
