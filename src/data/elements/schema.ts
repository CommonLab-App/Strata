import { z } from 'zod'

export const elementIndexSchema = z.array(z.object({ symbol: z.string(), name: z.string(), atomicNumber: z.number().int().min(1).max(118) })).length(118)

export const GOLDSCHMIDT = ['lithophile', 'siderophile', 'chalcophile', 'atmophile'] as const
export type Goldschmidt = (typeof GOLDSCHMIDT)[number]

export const crustSchema = z.object({
  sources: z.array(z.object({ id: z.string(), title: z.string(), url: z.url(), accessed: z.iso.date() })),
  elements: z.record(
    z.string(),
    z.object({
      /** Crustal abundance, parts per million by mass. */
      crustPpm: z.number().positive().optional(),
      crustSource: z.string().optional(),
      goldschmidt: z.enum(GOLDSCHMIDT).optional(),
      goldschmidtSource: z.string().optional(),
    }),
  ),
})

export interface ElementPosition {
  period: number
  group: number | null
  block: 's' | 'p' | 'd' | 'f'
  row: number
  column: number
}

// The atomic number that ends each period: the noble gases.
const PERIOD_ENDS = [2, 10, 18, 36, 54, 86, 118]

/**
 * Where an element sits in the 18-column table, as Valence lays it out. Rows 1 to 7 are the periods; the f block,
 * cerium to lutetium and thorium to lawrencium, has no group and sits in rows 9 and 10 under columns 4 to 17.
 */
export function elementPosition(atomicNumber: number): ElementPosition {
  const period = PERIOD_ENDS.findIndex((end) => atomicNumber <= end) + 1
  const end = PERIOD_ENDS[period - 1]
  if (!Number.isInteger(atomicNumber) || atomicNumber < 1 || end === undefined) throw new Error(`no element has atomic number ${atomicNumber}`)
  const fromLeft = atomicNumber - (PERIOD_ENDS[period - 2] ?? 0)
  if (period >= 6 && fromLeft >= 4 && fromLeft <= 17) return { period, group: null, block: 'f', row: period + 3, column: fromLeft }
  const column = atomicNumber !== 2 && fromLeft <= (period >= 6 ? 3 : 2) ? fromLeft : 18 - (end - atomicNumber)
  const block = column <= 2 || atomicNumber === 2 ? 's' : column <= 12 ? 'd' : 'p'
  return { period, group: column, block, row: period, column }
}

/** The element symbols in a mineral formula, in order of first appearance. */
export const elementsInFormula = (formula: string): string[] => [...new Set(formula.match(/[A-Z][a-z]?/g) ?? [])]
