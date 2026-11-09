import { describe, expect, it } from 'vitest'
import field from '@data/gnss/cwu.final_nam14.20231230.json'
import index from '@data/gnss/index.json'
import { velocityFieldSchema } from './schema'

describe('bundled GNSS velocities', () => {
  const parsed = velocityFieldSchema.parse(field)
  it('is one row per station in the NAM14 frame', () => {
    expect(parsed.frame).toBe('NAM14')
    expect(new Set(parsed.stations.map((s) => s.station)).size).toBe(parsed.stations.length)
    expect(parsed.stations.length).toBeGreaterThan(2000)
  })
  it('carries provenance and names no station beyond its code', () => {
    const entry = index['cwu.final_nam14.20231230']
    expect(entry.url).toMatch(/^https:\/\/gage-data\.earthscope\.org\//)
    expect(entry.stations).toBe(parsed.stations.length)
    expect(Object.keys(parsed.stations[0]!)).not.toContain('name')
  })
})
