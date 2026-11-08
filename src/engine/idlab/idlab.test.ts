import { describe, expect, it } from 'vitest'
import minerals from '@data/samples/minerals.json'
import { mineralsSchema } from '@/data/samples/schema'
import { candidates, draw, emptyRecord, runTest, scoreTray, type LabConfig } from './index'

const library = mineralsSchema.parse(minerals)
const byId = (id: string) => {
  const m = library.find((x) => x.id === id)
  if (!m) throw new Error(id)
  return m
}
const core = library.filter((m) => m.core)
const config: LabConfig = { id: 'test', pool: core.map((m) => m.id), count: 12, tools: [], sufficiency: 2 }

describe('draw', () => {
  it('is the same for the same seed, distinct within a tray, and different for another seed', () => {
    const a = draw(config, 1)
    expect(a).toEqual(draw(config, 1))
    expect(new Set(a).size).toBe(12)
    expect(a.every((id) => config.pool.includes(id))).toBe(true)
    expect(draw(config, 2)).not.toEqual(a)
  })
  it('never asks for more than the pool holds', () => {
    expect(draw({ ...config, pool: ['quartz', 'calcite'], count: 5 }, 3)).toHaveLength(2)
  })
})

describe('runTest', () => {
  it('closes the hardness bracket from both sides', () => {
    let r = runTest(emptyRecord(), byId('calcite'), 'scratch:fingernail')
    expect(r.seen).toEqual({ hardnessMin: 2.5 })
    r = runTest(r, byId('calcite'), 'scratch:penny')
    expect(r.seen).toEqual({ hardnessMin: 2.5, hardnessMax: 3.5 })
    r = runTest(r, byId('calcite'), 'scratch:penny')
    expect(r.tests).toEqual(['scratch:fingernail', 'scratch:penny'])
  })
  it('reads streak, cleavage, acid and magnet off the entry', () => {
    const r = ['streak', 'cleavage', 'acid', 'magnet'].reduce((rec, t) => runTest(rec, byId('magnetite'), t as never), emptyRecord())
    expect(r.seen).toEqual({ streak: 'black', cleavageDirections: 0, cleavageQuality: 'none', acid: 'none', magnetic: true })
  })
  it('gives a density inside the range, the same for the same seed and position', () => {
    const a = runTest(emptyRecord(), byId('galena'), 'density', 7, 3).seen.density!
    expect(a).toBe(runTest(emptyRecord(), byId('galena'), 'density', 7, 3).seen.density)
    expect(a).toBeGreaterThan(7.0)
    expect(a).toBeLessThan(8.0)
  })
})

describe('candidates', () => {
  it('narrows calcite to itself with streak, fizz and hardness; colour alone excludes nothing', () => {
    const calcite = byId('calcite')
    let r = runTest(emptyRecord(), calcite, 'hand-lens')
    expect(candidates(r.seen, core).length).toBeGreaterThan(5)
    r = runTest(r, calcite, 'acid')
    r = runTest(r, calcite, 'scratch:penny')
    r = runTest(r, calcite, 'scratch:fingernail')
    const left = candidates(r.seen, core).map((m) => m.id)
    expect(left).toEqual(['calcite'])
  })
  it('keeps the true mineral in the candidate set after every tool, for every core mineral', () => {
    for (const m of core) {
      let r = emptyRecord()
      for (const t of ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage', 'acid', 'magnet', 'density'] as const) r = runTest(r, m, t, 5, 1)
      expect(candidates(r.seen, core).map((x) => x.id), m.id).toContain(m.id)
    }
  })
  it('every core mineral can be narrowed to at most two candidates with all tools', () => {
    const stuck: string[] = []
    for (const m of core) {
      let r = emptyRecord()
      for (const t of ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage', 'acid', 'magnet', 'density'] as const) r = runTest(r, m, t, 5, 1)
      const left = candidates(r.seen, core).map((x) => x.id)
      if (left.length > 2) stuck.push(`${m.id}: ${left.join(', ')}`)
    }
    expect(stuck).toEqual([])
  })
})

describe('scoreTray', () => {
  it('scores right, wrong and insufficient rows', () => {
    const drawn = ['calcite', 'quartz']
    const good = ['streak', 'acid', 'scratch:penny', 'scratch:fingernail'].reduce((rec, t) => runTest(rec, byId('calcite'), t as never), emptyRecord())
    const thin = runTest(emptyRecord(), byId('quartz'), 'hand-lens')
    const s = scoreTray(config, [good, thin], ['calcite', 'halite'], drawn, core)
    expect(s.correct).toBe(1)
    expect(s.total).toBe(2)
    expect(s.rows[0]).toMatchObject({ correct: true, sufficient: true })
    expect(s.rows[1]).toMatchObject({ correct: false, sufficient: false })
  })
})
