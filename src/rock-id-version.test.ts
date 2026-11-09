import { describe, expect, it } from 'vitest'
import { IGNEOUS_ID, METAMORPHIC_ID, SEDIMENTARY_ID } from './app/lab/labs'
import { WEEKS } from './app/weeks'
import { drawRocks } from './engine/idlab/rocks'

// As src/mineral-id-version.test.ts: the seed-1 draw and pool size of each rock lab are pinned to the week's
// stored-entry version, so a pool change bumps the version.
describe('the rock identification labs', () => {
  it('pin pool and draw to the stored-entry version of weeks 4, 6 and 7', () => {
    expect({ v: [WEEKS[3].version, WEEKS[5].version, WEEKS[6].version], pools: [IGNEOUS_ID.pool.length, SEDIMENTARY_ID.pool.length, METAMORPHIC_ID.pool.length], draws: [drawRocks(IGNEOUS_ID, 1), drawRocks(SEDIMENTARY_ID, 1), drawRocks(METAMORPHIC_ID, 1)] }).toEqual({
      v: [2, 2, 2],
      pools: [7, 7, 4],
      draws: [["basalt", "granite", "gabbro", "porphyry", "obsidian", "rhyolite"], ["fossiliferous-limestone", "conglomerate", "limestone", "coal", "oolitic-limestone", "sandstone"], ["gneiss", "slate", "marble", "schist"]],
    })
  })
})
