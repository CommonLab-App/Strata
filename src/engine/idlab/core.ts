import { seeded } from '../random'

/** What every identification lab shares: a seeded tray, a record per unknown, a key, and a score. */
export interface LabConfig {
  id: string
  /** Sample ids the tray may draw from. */
  pool: string[]
  count: number
  tools: string[]
  /** A row counts as sufficiently tested when its observations leave at most this many candidates. */
  sufficiency: number
}

export interface Record<S> {
  tests: string[]
  seen: S
}

export const emptyRecordOf = <S extends object>(): Record<S> => ({ tests: [], seen: {} as S })

/** The sample ids on the tray for this seed: distinct, in tray order. Stored progress keeps the seed, not the ids. */
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

export const candidatesBy = <T, S>(seen: S, pool: T[], consistent: (seen: S, item: T) => boolean): T[] => pool.filter((item) => consistent(seen, item))

export interface RowScore {
  correct: boolean
  sufficient: boolean
  candidatesLeft: number
}

export function scoreTrayBy<T extends { id: string }, S extends object>(
  config: LabConfig,
  records: Record<S>[],
  answers: (string | null)[],
  drawn: string[],
  pool: T[],
  consistent: (seen: S, item: T) => boolean,
): { rows: RowScore[]; correct: number; total: number } {
  const rows = drawn.map((d, i) => {
    const left = candidatesBy((records[i] ?? emptyRecordOf<S>()).seen, pool, consistent).length
    return { correct: (answers[i] ?? null) === d, sufficient: left <= config.sufficiency, candidatesLeft: left }
  })
  return { rows, correct: rows.filter((r) => r.correct).length, total: rows.length }
}
