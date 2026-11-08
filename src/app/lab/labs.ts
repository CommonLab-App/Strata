import type { LabConfig } from '@/engine/idlab'
import { coreMineralIds } from './library'

/**
 * The identification labs, one per week. A change to a pool, count or tool list regrades stored trays, so each is
 * pinned by a version test (src/*-version.test.ts) to the week's stored-entry version in src/app/weeks.ts.
 */
export const MINERAL_ID_1: LabConfig = {
  id: 'mineral-id-1',
  // Twenty common minerals that hand lens, streak, scratch set and cleavage tell apart. Olivine, garnet and gypsum
  // wait for week 3: without density they are twins of quartz and muscovite at this bench.
  pool: ['quartz', 'orthoclase', 'plagioclase', 'muscovite', 'biotite', 'hornblende', 'apatite', 'corundum', 'calcite', 'chalcopyrite', 'halite', 'fluorite', 'talc', 'galena', 'pyrite', 'magnetite', 'hematite', 'graphite', 'sulfur', 'kaolinite'],
  count: 12,
  tools: ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage'],
  sufficiency: 2,
}

export const MINERAL_ID_2: LabConfig = {
  id: 'mineral-id-2',
  pool: coreMineralIds,
  count: 15,
  tools: ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage', 'acid', 'magnet', 'density'],
  sufficiency: 2,
}
