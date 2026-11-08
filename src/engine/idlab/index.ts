import type { Mineral } from '@/data/samples/schema'
import { seeded } from '../random'

/**
 * The identification lab's rules, apart from any screen: which unknowns a seed draws, what each bench tool reveals
 * about a mineral, which library entries are still consistent with what has been seen, and how an answer scores.
 * Every function is a pure function of its arguments, so a stored seed and record reproduce a tray and a score.
 */

/** Scratch tools and the Mohs hardness each one has, as intro labs give them. */
export const SCRATCHERS = { fingernail: 2.5, penny: 3.5, glass: 5.5, 'streak-plate': 6.5, quartz: 7 } as const
export type Scratcher = keyof typeof SCRATCHERS

export type Tool = 'hand-lens' | 'streak' | 'cleavage' | 'acid' | 'magnet' | 'density' | `scratch:${Scratcher}`
export const MINERAL_TOOLS: Tool[] = ['hand-lens', 'streak', 'scratch:fingernail', 'scratch:penny', 'scratch:glass', 'scratch:streak-plate', 'scratch:quartz', 'cleavage', 'acid', 'magnet', 'density']

export interface Observations {
  colour?: string[]
  luster?: string[]
  streak?: string
  /** The bracket the scratch tests have closed so far: harder than min, not harder than max. */
  hardnessMin?: number
  hardnessMax?: number
  cleavageDirections?: number
  cleavageQuality?: string
  acid?: 'fizzes' | 'fizzes-powdered' | 'none'
  magnetic?: boolean
  /** Two readings, as the balance and cylinder give them. */
  density?: number
}

export interface UnknownRecord {
  /** Tools run, in order. */
  tests: Tool[]
  seen: Observations
}

export interface LabConfig {
  id: string
  /** Mineral ids the tray may draw from. */
  pool: string[]
  count: number
  tools: Tool[]
  /** A row counts as sufficiently tested when its observations leave at most this many candidates. */
  sufficiency: number
}

export const emptyRecord = (): UnknownRecord => ({ tests: [], seen: {} })

/** The mineral ids on the tray for this seed: distinct, in tray order. Stored progress keeps the seed, not the ids. */
export function draw(config: LabConfig, seed: number): string[] {
  const random = seeded(seed)
  const pool = [...config.pool]
  const out: string[] = []
  const target = Math.min(config.count, pool.length)
  while (out.length < target) {
    const [picked] = pool.splice(Math.floor(random() * pool.length), 1)
    if (picked) out.push(picked)
  }
  return out
}

/**
 * What running `tool` on `mineral` adds to a record. The result is read from the library entry, never typed. The
 * density tool's reading error is seeded from the tray seed and tray position, so it is the same on every load.
 */
export function runTest(record: UnknownRecord, mineral: Mineral, tool: Tool, seed = 0, position = 0): UnknownRecord {
  if (record.tests.includes(tool)) return record
  const seen: Observations = { ...record.seen }
  if (tool === 'hand-lens') {
    seen.colour = mineral.colour
    seen.luster = mineral.luster
  } else if (tool === 'streak') {
    seen.streak = mineral.streak
  } else if (tool.startsWith('scratch:')) {
    const h = SCRATCHERS[tool.slice('scratch:'.length) as Scratcher]
    // The tool scratches the mineral when the tool is harder. A mineral of hardness h is scratched by a tool of h.
    const scratched = h >= mineral.hardness[0]
    if (scratched) seen.hardnessMax = Math.min(seen.hardnessMax ?? Infinity, h)
    else seen.hardnessMin = Math.max(seen.hardnessMin ?? -Infinity, h)
  } else if (tool === 'cleavage') {
    seen.cleavageDirections = mineral.cleavage.directions
    seen.cleavageQuality = mineral.cleavage.quality
  } else if (tool === 'acid') {
    seen.acid = mineral.diagnostic.acid ?? 'none'
  } else if (tool === 'magnet') {
    seen.magnetic = mineral.diagnostic.magnetic ?? false
  } else if (tool === 'density') {
    const random = seeded(seed * 1000 + position)
    const [lo, hi] = mineral.density
    const truth = lo + (hi - lo) * random()
    // ponytail: a plain ±3 % reading error; the two readings are folded into one figure the worksheet shows.
    seen.density = Math.round(truth * (1 + (random() - 0.5) * 0.06) * 100) / 100
  }
  return { tests: [...record.tests, tool], seen }
}

const norm = (s: string) => s.trim().toLowerCase()

/** True when the library entry could have produced these observations. Colour never excludes: it varies too much. */
export function consistent(seen: Observations, mineral: Mineral): boolean {
  if (seen.streak !== undefined && norm(seen.streak) !== norm(mineral.streak)) return false
  if (seen.luster && !seen.luster.some((l) => mineral.luster.includes(l as Mineral['luster'][number]))) return false
  if (seen.hardnessMin !== undefined && mineral.hardness[1] <= seen.hardnessMin) return false
  if (seen.hardnessMax !== undefined && mineral.hardness[0] > seen.hardnessMax) return false
  if (seen.cleavageDirections !== undefined && mineral.cleavage.directions !== seen.cleavageDirections) return false
  if (seen.acid !== undefined && (mineral.diagnostic.acid ?? 'none') !== seen.acid) return false
  if (seen.magnetic !== undefined && (mineral.diagnostic.magnetic ?? false) !== seen.magnetic) return false
  // The reading carries up to ±3 % of error, so the match allows 5 % either side of the entry's range.
  if (seen.density !== undefined && (seen.density < mineral.density[0] * 0.95 || seen.density > mineral.density[1] * 1.05)) return false
  return true
}

/** The entries of the pool still consistent with the record: the key the learner sees narrowing. */
export function candidates(seen: Observations, pool: Mineral[]): Mineral[] {
  return pool.filter((m) => consistent(seen, m))
}

export interface RowScore {
  correct: boolean
  sufficient: boolean
  candidatesLeft: number
}

/** One row: right when the answer is the drawn species; sufficient when the tests alone would have narrowed enough. */
export function scoreRow(config: LabConfig, record: UnknownRecord, answer: string | null, drawn: string, pool: Mineral[]): RowScore {
  const left = candidates(record.seen, pool).length
  return { correct: answer === drawn, sufficient: left <= config.sufficiency, candidatesLeft: left }
}

export function scoreTray(config: LabConfig, records: UnknownRecord[], answers: (string | null)[], drawn: string[], pool: Mineral[]): { rows: RowScore[]; correct: number; total: number } {
  const rows = drawn.map((d, i) => scoreRow(config, records[i] ?? emptyRecord(), answers[i] ?? null, d, pool))
  return { rows, correct: rows.filter((r) => r.correct).length, total: rows.length }
}
