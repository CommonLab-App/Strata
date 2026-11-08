import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import minerals from '@data/samples/minerals.json'
import { mineralsSchema } from './schema'

describe('mineral library', () => {
  const parsed = mineralsSchema.parse(minerals)

  it('validates, with unique ids and at least a core tray', () => {
    expect(parsed.length).toBeGreaterThanOrEqual(40)
    expect(parsed.filter((m) => m.core).length).toBeGreaterThanOrEqual(30)
  })

  it('gives every mineral a source for its values and a streak the key can match', () => {
    for (const m of parsed) {
      expect(m.sources.length, m.id).toBeGreaterThan(0)
      expect(m.streak.trim(), m.id).not.toBe('')
    }
  })

  it('names every specimen video that is present on disk correctly, and tolerates the media folder being absent', () => {
    for (const m of parsed) {
      for (const s of m.specimens) {
        if (!s.turntable) continue
        const dir = `public/media/samples/${s.id}`
        if (!existsSync(dir)) continue
        expect(existsSync(`${dir}/${s.turntable.file}`), s.id).toBe(true)
        expect(existsSync(`${dir}/${s.turntable.poster}`), s.id).toBe(true)
      }
    }
  })
})
