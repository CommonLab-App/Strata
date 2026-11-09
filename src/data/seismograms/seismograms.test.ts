import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import index from '@data/seismograms/index.json'
import { EVENT_IDS, teachingEventSchema } from './schema'

describe('bundled teaching earthquakes', () => {
  it('match the index and parse, with reference picks inside the record', () => {
    expect(index.events.map((e) => e.id).sort()).toEqual([...EVENT_IDS].sort())
    for (const id of EVENT_IDS) {
      const ev = teachingEventSchema.parse(JSON.parse(readFileSync(new URL(`../../../data/seismograms/${id}.json`, import.meta.url), 'utf8')))
      for (const s of ev.stations) {
        expect(s.refP).toBeGreaterThan(0)
        expect(s.refS).toBeGreaterThan(s.refP)
        expect(s.refS).toBeLessThan(s.samples.length)
        expect(s.request.startsWith('https://service.earthscope.org/')).toBe(true)
      }
    }
  })
})
