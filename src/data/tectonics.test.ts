import { describe, expect, it } from 'vitest'
import boundaries from '@data/tectonics/pb2002-boundaries.json'
import index from '@data/tectonics/index.json'
import { BOUNDARY_KIND } from '@/engine/tectonics/motion'

describe('bundled plate boundaries', () => {
  it('carry provenance: url, date and licence', () => {
    const entry = index['pb2002-boundaries']
    expect(entry.url).toMatch(/^https:\/\//)
    expect(entry.fetched).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(entry.licence).toBe('ODC-BY 1.0')
    expect(entry.features).toBe(boundaries.features.length)
  })
  it('every line has a textbook kind and at least two points', () => {
    const kinds = new Set(Object.values(BOUNDARY_KIND))
    for (const f of boundaries.features) {
      expect(kinds.has(f.properties.kind as never)).toBe(true)
      expect(f.geometry.coordinates.length).toBeGreaterThan(1)
    }
  })
})
