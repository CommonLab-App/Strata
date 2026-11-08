import type { Rock } from '@/data/samples/schema'
import { candidatesBy, draw as drawCore, emptyRecordOf, scoreTrayBy, type LabConfig as CoreConfig, type Record } from './core'

/**
 * The rock identification lab's rules: what each bench step reveals about a rock, and which library entries are
 * still consistent. A hand lens says what kind of rock it is and how it is put together; the grain gauge measures
 * clastic grains; the mineral look names what can be seen; dilute acid finds carbonate.
 */
export type RockTool = 'hand-lens' | 'grain-gauge' | 'minerals' | 'acid'
export const ROCK_TOOLS: RockTool[] = ['hand-lens', 'grain-gauge', 'minerals', 'acid']

export type RockObservations = {
  class?: Rock['class']
  /** Igneous grain texture. */
  grain?: string
  /** Igneous: percent dark minerals, roughly; null for glass and froth. */
  colourIndex?: number | null
  /** Sedimentary kind. */
  kind?: string
  grainSizeMm?: [number, number] | null
  sorting?: string | null
  rounding?: string | null
  /** Metamorphic. */
  foliated?: boolean
  texture?: string
  grade?: string
  /** Minerals seen with the lens, as the entry lists them. */
  minerals?: string[]
  acid?: 'fizzes' | 'fizzes-powdered' | 'none'
}

export type RockRecord = Record<RockObservations>
export interface RockLabConfig extends CoreConfig {
  tools: RockTool[]
}

export const emptyRockRecord = (): RockRecord => emptyRecordOf<RockObservations>()
export const drawRocks = (config: RockLabConfig, seed: number): string[] => drawCore(config, seed)

export function runRockTest(record: RockRecord, rock: Rock, tool: RockTool): RockRecord {
  if (record.tests.includes(tool)) return record
  const seen: RockObservations = { ...record.seen }
  if (tool === 'hand-lens') {
    seen.class = rock.class
    if (rock.class === 'igneous') {
      seen.grain = rock.texture.grain
      seen.colourIndex = rock.colourIndex
    } else if (rock.class === 'sedimentary') {
      seen.kind = rock.texture.kind
    } else {
      seen.foliated = rock.texture.foliated
      seen.texture = rock.texture.texture
    }
  } else if (tool === 'grain-gauge') {
    if (rock.class === 'sedimentary') {
      seen.grainSizeMm = rock.texture.grainSizeMm ?? null
      seen.sorting = rock.texture.sorting ?? null
      seen.rounding = rock.texture.rounding ?? null
    } else if (rock.class === 'igneous') {
      seen.grain = rock.texture.grain
    } else {
      seen.grade = rock.texture.grade
    }
  } else if (tool === 'minerals') {
    seen.minerals = rock.class === 'metamorphic' ? rock.composition.indexMinerals : rock.composition.minerals
    if (rock.class === 'metamorphic') seen.grade = rock.texture.grade
  } else if (tool === 'acid') {
    seen.acid = rock.class === 'igneous' ? 'none' : rock.acid
  }
  return { tests: [...record.tests, tool], seen }
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))
const overlap = (a: [number, number] | null | undefined, b: [number, number] | undefined) => (a == null || b === undefined ? a == null && b === undefined : a[0] <= b[1] && b[0] <= a[1])

export function consistentRock(seen: RockObservations, rock: Rock): boolean {
  if (seen.class !== undefined && seen.class !== rock.class) return false
  if (seen.acid !== undefined && (rock.class === 'igneous' ? 'none' : rock.acid) !== seen.acid) return false
  if (seen.minerals !== undefined && !sameSet(seen.minerals, rock.class === 'metamorphic' ? rock.composition.indexMinerals : rock.composition.minerals)) return false
  if (rock.class === 'igneous') {
    if (seen.grain !== undefined && seen.grain !== rock.texture.grain) return false
    if (seen.colourIndex !== undefined && (seen.colourIndex === null) !== (rock.colourIndex === null)) return false
    // Colour index is read by eye, so a reading matches an entry within fifteen points.
    if (seen.colourIndex != null && rock.colourIndex != null && Math.abs(seen.colourIndex - rock.colourIndex) > 15) return false
  } else if (rock.class === 'sedimentary') {
    if (seen.kind !== undefined && seen.kind !== rock.texture.kind) return false
    if (seen.grainSizeMm !== undefined && !overlap(seen.grainSizeMm, rock.texture.grainSizeMm)) return false
    if (seen.sorting !== undefined && (seen.sorting ?? null) !== (rock.texture.sorting ?? null)) return false
    if (seen.rounding !== undefined && (seen.rounding ?? null) !== (rock.texture.rounding ?? null)) return false
  } else {
    if (seen.foliated !== undefined && seen.foliated !== rock.texture.foliated) return false
    if (seen.texture !== undefined && seen.texture !== rock.texture.texture) return false
    if (seen.grade !== undefined && seen.grade !== rock.texture.grade) return false
  }
  return true
}

export const rockCandidates = (seen: RockObservations, pool: Rock[]): Rock[] => candidatesBy(seen, pool, consistentRock)
export const scoreRockTray = (config: RockLabConfig, records: RockRecord[], answers: (string | null)[], drawn: string[], pool: Rock[]) => scoreTrayBy(config, records, answers, drawn, pool, consistentRock)
