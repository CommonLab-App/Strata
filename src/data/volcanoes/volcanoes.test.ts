import { describe, expect, it } from 'vitest'
import holocene from '@data/volcanoes/holocene.json'
import index from '@data/volcanoes/index.json'
import { largestVei, volcanoesSchema } from './schema'

describe('bundled GVP volcanoes', () => {
  const rows = volcanoesSchema.parse(holocene)
  it('match the index and carry provenance', () => {
    expect(index.holocene.volcanoes).toBe(rows.length)
    expect(index.holocene.eruptions).toBe(rows.reduce((n, r) => n + r.eruptions.length, 0))
    expect(index.holocene.urls.every((u) => u.startsWith('https://webservices.volcano.si.edu/'))).toBe(true)
    expect(index.holocene.fetched).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
  it('have unique numbers and eruptions sorted by year', () => {
    expect(new Set(rows.map((r) => r.number)).size).toBe(rows.length)
    for (const r of rows) for (let i = 1; i < r.eruptions.length; i++) expect(r.eruptions[i]![0]).toBeGreaterThanOrEqual(r.eruptions[i - 1]![0])
  })
  it('largestVei ignores uncertain and unrated eruptions', () => {
    expect(largestVei({ ...rows[0]!, eruptions: [[1900, 5, false], [1950, null, true], [1980, 3, true]] })).toBe(3)
    expect(largestVei({ ...rows[0]!, eruptions: [] })).toBeNull()
  })
})
