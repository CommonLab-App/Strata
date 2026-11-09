import type { LabConfig } from '@/engine/idlab'
import { coreMineralIds } from './library'

/**
 * The identification labs, one per week. A change to a pool, count or tool list regrades stored trays, so each is
 * pinned by a version test (src/*-version.test.ts) to the week's stored-entry version in src/app/weeks.ts.
 */
export const MINERAL_ID_1: LabConfig = {
  id: 'mineral-id-1',
  // The core set without gypsum: it has no density tool here and is a twin of muscovite and kaolinite at this bench.
  pool: coreMineralIds.filter((id) => id !== 'gypsum'),
  count: 10,
  tools: ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage'],
  sufficiency: 2,
}

export const MINERAL_ID_2: LabConfig = {
  id: 'mineral-id-2',
  pool: coreMineralIds,
  count: 12,
  tools: ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage', 'acid', 'magnet', 'density'],
  sufficiency: 2,
}

import type { RockLabConfig } from '@/engine/idlab/rocks'
import { coreRockIds } from '@/app/rocks/library'

export const IGNEOUS_ID: RockLabConfig = { id: 'igneous-id', pool: coreRockIds('igneous'), count: 6, tools: ['hand-lens', 'grain-gauge', 'minerals'], sufficiency: 2 }
export const SEDIMENTARY_ID: RockLabConfig = { id: 'sedimentary-id', pool: coreRockIds('sedimentary'), count: 6, tools: ['hand-lens', 'grain-gauge', 'minerals', 'acid'], sufficiency: 2 }
export const METAMORPHIC_ID: RockLabConfig = { id: 'metamorphic-id', pool: coreRockIds('metamorphic'), count: 4, tools: ['hand-lens', 'minerals', 'acid'], sufficiency: 2 }
