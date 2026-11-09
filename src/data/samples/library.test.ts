import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import cifIndex from '@data/cif/index.json'
import minerals from '@data/samples/minerals.json'
import { mineralsSchema } from './schema'

describe('mineral library', () => {
  const parsed = mineralsSchema.parse(minerals)

  it('validates, with unique ids and at least a core tray', () => {
    expect(parsed.length).toBeGreaterThanOrEqual(40)
    expect(parsed.filter((m) => m.core).length).toBeGreaterThanOrEqual(12)
  })

  it('gives every mineral a source for its values and a streak the key can match', () => {
    for (const m of parsed) {
      expect(m.sources.length, m.id).toBeGreaterThan(0)
      expect(m.streak.trim(), m.id).not.toBe('')
    }
  })

  it('links every structure file that exists, and only existing ones', () => {
    const index = cifIndex as Record<string, unknown>
    for (const m of parsed) {
      if (m.cif) expect(index[m.cif], `${m.id} -> ${m.cif}`).toBeDefined()
      if (index[m.id]) expect(m.cif, `${m.id} has a structure file but no cif key`).toBe(m.id)
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

describe('rock library', async () => {
  const { rocksSchema } = await import('./schema')
  const rocks = (await import('@data/samples/rocks.json')).default
  const parsed = rocksSchema.parse(rocks)
  const mineralIds = new Set((mineralsSchema.parse(minerals)).map((m) => m.id))
  const rockIds = new Set(parsed.map((r) => r.id))

  it('validates, with a core set of each class', () => {
    expect(parsed.length).toBeGreaterThanOrEqual(40)
    for (const cls of ['igneous', 'sedimentary', 'metamorphic'] as const) expect(parsed.filter((r) => r.class === cls && r.core).length, cls).toBeGreaterThanOrEqual(4)
  })

  it('names only minerals and rocks that exist', () => {
    for (const r of parsed) {
      const minerals = r.class === 'metamorphic' ? r.composition.indexMinerals : r.composition.minerals
      for (const m of minerals) expect(mineralIds.has(m), `${r.id}: mineral ${m}`).toBe(true)
      if (r.class === 'igneous' && r.related.twin) expect(rockIds.has(r.related.twin), `${r.id}: twin ${r.related.twin}`).toBe(true)
      if (r.class === 'metamorphic') for (const p of r.related.parent) expect(rockIds.has(p), `${r.id}: parent ${p}`).toBe(true)
    }
  })

  it('fills every igneous grid cell that an intro course names', () => {
    const cells = new Set(parsed.filter((r) => r.class === 'igneous' && ['phaneritic', 'aphanitic'].includes(r.texture.grain)).map((r) => (r.class === 'igneous' ? `${r.texture.grain}/${r.composition.silica}` : '')))
    for (const grain of ['phaneritic', 'aphanitic']) for (const silica of ['felsic', 'intermediate', 'mafic', 'ultramafic']) expect(cells.has(`${grain}/${silica}`), `${grain}/${silica}`).toBe(true)
  })
})
