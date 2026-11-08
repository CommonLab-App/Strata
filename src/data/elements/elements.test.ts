import { describe, expect, it } from 'vitest'
import crust from '@data/elements/crust.json'
import index from '@data/elements/index.json'
import minerals from '@data/samples/minerals.json'
import { crustSchema, elementIndexSchema, elementPosition, elementsInFormula } from './schema'

describe('element data', () => {
  const elements = elementIndexSchema.parse(index)
  const geo = crustSchema.parse(crust)

  it('has geology data only for real symbols, with the eight major crust elements in the known order', () => {
    const symbols = new Set(elements.map((e) => e.symbol))
    for (const s of Object.keys(geo.elements)) expect(symbols.has(s), s).toBe(true)
    const byPpm = Object.entries(geo.elements)
      .filter(([, v]) => v.crustPpm)
      .sort((a, b) => b[1].crustPpm! - a[1].crustPpm!)
      .map(([s]) => s)
    expect(byPpm.slice(0, 8)).toEqual(['O', 'Si', 'Al', 'Fe', 'Ca', 'Na', 'Mg', 'K'])
    for (const v of Object.values(geo.elements)) {
      if (v.crustPpm) expect(geo.sources.some((s) => s.id === v.crustSource)).toBe(true)
      if (v.goldschmidt) expect(geo.sources.some((s) => s.id === v.goldschmidtSource)).toBe(true)
    }
  })

  it('places elements where the table has them', () => {
    expect(elementPosition(1)).toMatchObject({ row: 1, column: 1 })
    expect(elementPosition(2)).toMatchObject({ row: 1, column: 18 })
    expect(elementPosition(14)).toMatchObject({ row: 3, column: 14, block: 'p' })
    expect(elementPosition(26)).toMatchObject({ row: 4, column: 8, block: 'd' })
    expect(elementPosition(58)).toMatchObject({ row: 9, column: 4, block: 'f' })
    expect(elementPosition(71)).toMatchObject({ row: 9, column: 17 })
    expect(elementPosition(72)).toMatchObject({ row: 6, column: 4 })
    const seen = new Set<string>()
    for (const e of elements) {
      const p = elementPosition(e.atomicNumber)
      const key = `${p.row}-${p.column}`
      expect(seen.has(key), key).toBe(false)
      seen.add(key)
    }
  })

  it('reads the elements out of every library formula, and every one is a real symbol', () => {
    const symbols = new Set(elements.map((e) => e.symbol))
    expect(elementsInFormula('KAl2(AlSi3O10)(OH)2')).toEqual(['K', 'Al', 'Si', 'O', 'H'])
    expect(elementsInFormula('NaAlSi3O8 to CaAl2Si2O8')).toEqual(['Na', 'Al', 'Si', 'O', 'Ca'])
    for (const m of minerals as { id: string; formula: string }[]) for (const s of elementsInFormula(m.formula)) expect(symbols.has(s), `${m.id}: ${s}`).toBe(true)
  })
})
