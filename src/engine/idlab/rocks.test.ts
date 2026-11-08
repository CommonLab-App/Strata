import { describe, expect, it } from 'vitest'
import rocks from '@data/samples/rocks.json'
import { rocksSchema } from '@/data/samples/schema'
import { drawRocks, emptyRockRecord, ROCK_TOOLS, rockCandidates, runRockTest, scoreRockTray, type RockLabConfig } from './rocks'

const library = rocksSchema.parse(rocks)
const core = library.filter((r) => r.core)
const byId = (id: string) => library.find((r) => r.id === id)!

describe('rock identification', () => {
  it('reads class and texture with the hand lens, grains with the gauge, carbonate with acid', () => {
    let r = runRockTest(emptyRockRecord(), byId('conglomerate'), 'hand-lens')
    expect(r.seen).toEqual({ class: 'sedimentary', kind: 'clastic' })
    r = runRockTest(r, byId('conglomerate'), 'grain-gauge')
    expect(r.seen.grainSizeMm).toEqual([2, 256])
    expect(r.seen.rounding).toBe('rounded')
    expect(runRockTest(emptyRockRecord(), byId('marble'), 'acid').seen.acid).toBe('fizzes')
    expect(runRockTest(emptyRockRecord(), byId('granite'), 'acid').seen.acid).toBe('none')
    expect(runRockTest(emptyRockRecord(), byId('gneiss'), 'hand-lens').seen).toEqual({ class: 'metamorphic', foliated: true, texture: 'gneissic' })
  })

  it('keeps the true rock in its own candidate set and narrows every core rock to at most two with every tool', () => {
    const stuck: string[] = []
    for (const rock of core) {
      let r = emptyRockRecord()
      for (const t of ROCK_TOOLS) r = runRockTest(r, rock, t)
      const left = rockCandidates(r.seen, core).map((x) => x.id)
      expect(left, rock.id).toContain(rock.id)
      if (left.length > 2) stuck.push(`${rock.id}: ${left.join(', ')}`)
    }
    expect(stuck).toEqual([])
  })

  it('draws and scores like the mineral lab', () => {
    const config: RockLabConfig = { id: 't', pool: core.map((r) => r.id), count: 8, tools: ROCK_TOOLS, sufficiency: 2 }
    const drawn = drawRocks(config, 1)
    expect(drawn).toHaveLength(8)
    expect(drawn).toEqual(drawRocks(config, 1))
    const full = ROCK_TOOLS.reduce((rec, t) => runRockTest(rec, byId(drawn[0]!), t), emptyRockRecord())
    const s = scoreRockTray(config, [full, emptyRockRecord()], [drawn[0]!, null], drawn.slice(0, 2), core)
    expect(s.rows[0]).toMatchObject({ correct: true, sufficient: true })
    expect(s.rows[1]).toMatchObject({ correct: false, sufficient: false })
  })
})
