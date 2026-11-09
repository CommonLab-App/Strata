import { describe, expect, it } from 'vitest'
import { MINERAL_ID_1, MINERAL_ID_2 } from './app/lab/labs'
import { WEEKS } from './app/weeks'
import { draw } from './engine/idlab'

// A stored tray holds a seed, not its minerals: the ids are drawn again from the pool on every load. So a change to
// a pool, a count or the draw would change what a learner's stored answers are judged against, unless the week's
// stored-entry version changes with it. This pins the draw for seed 1 to the versions in src/app/weeks.ts.
describe('the mineral identification labs', () => {
  it('pin pool, count and draw to the stored-entry version of weeks 2 and 3', () => {
    expect({ v2: WEEKS[1].version, v3: WEEKS[2].version, draw2: draw(MINERAL_ID_1, 1), draw3: draw(MINERAL_ID_2, 1), pool2: MINERAL_ID_1.pool.length, pool3: MINERAL_ID_2.pool.length }).toEqual({
      v2: 2,
      v3: 2,
      draw2: ["kaolinite", "quartz", "halite", "graphite", "hematite", "biotite", "fluorite", "pyrite", "hornblende", "magnetite"],
      draw3: ["fluorite", "quartz", "halite", "graphite", "hematite", "biotite", "gypsum", "pyrite", "hornblende", "magnetite", "muscovite", "calcite"],
      pool2: 13,
      pool3: 14,
    })
  })

  it('every week-2 pool mineral narrows to two or fewer with the week-2 tools', async () => {
    const { MINERALS } = await import('./app/lab/library')
    const { candidates, emptyRecord, runTest } = await import('./engine/idlab')
    const pool = MINERALS.filter((m) => MINERAL_ID_1.pool.includes(m.id))
    const stuck: string[] = []
    for (const m of pool) {
      let r = emptyRecord()
      for (const t of MINERAL_ID_1.tools) r = runTest(r, m, t, 1, 0)
      const left = candidates(r.seen, pool).map((x) => x.id)
      if (left.length > MINERAL_ID_1.sufficiency) stuck.push(`${m.id}: ${left.join(', ')}`)
    }
    expect(stuck).toEqual([])
  })
})
