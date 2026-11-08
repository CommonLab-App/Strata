import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import index from '@data/cif/index.json'
import { applyOp, bonds, buildCell, distance, repeatCell, withNeighbours } from './cell'
import { cifNumber, parseCif } from './cif'

const load = (id: string) => parseCif(readFileSync(`data/cif/${id}.cif`, 'utf8'))
const count = (atoms: { element: string }[], el: string) => atoms.filter((a) => a.element === el).length

describe('cif reader', () => {
  it('reads numbers with uncertainties', () => {
    expect(cifNumber('4.9134(2)')).toBeCloseTo(4.9134)
    expect(cifNumber('?')).toBeNaN()
  })
  it('reads every fetched structure: a cell, symmetry, and sites', () => {
    for (const id of Object.keys(index)) {
      const cif = load(id)
      expect(cif.cell.a, id).toBeGreaterThan(2)
      expect(cif.symmetry.length, id).toBeGreaterThan(0)
      expect(cif.sites.length, id).toBeGreaterThan(0)
    }
  })
  it('evaluates symmetry operations', () => {
    expect(applyOp('x,y,z', [0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3])
    expect(applyOp('-x+1/2,y,-z', [0.1, 0.2, 0.3])).toEqual([0.4, 0.2, -0.3])
    expect(applyOp('y-x,-x,z+2/3', [0.1, 0.2, 0.3]).map((v) => Math.round(v * 1000) / 1000)).toEqual([0.1, -0.1, 0.967])
  })
})

describe('unit cells', () => {
  it('builds halite with 4 Na and 4 Cl and a Na–Cl bond near 2.82 Å', () => {
    const cif = load('halite')
    const atoms = buildCell(cif)
    expect(count(atoms, 'Na')).toBe(4)
    expect(count(atoms, 'Cl')).toBe(4)
    const big = repeatCell(cif, atoms, 2)
    const b = bonds(big, 1.1)
    expect(b.length).toBeGreaterThan(0)
    const d = b.map(([i, j]) => distance(big[i]!, big[j]!))
    expect(Math.min(...d)).toBeCloseTo(2.82, 1)
  })
  it('builds quartz with 3 Si and 6 O and Si–O bonds of about 1.61 Å', () => {
    const cif = load('quartz')
    const atoms = buildCell(cif)
    expect(count(atoms, 'Si')).toBe(3)
    expect(count(atoms, 'O')).toBe(6)
    const big = repeatCell(cif, atoms, 2)
    const d = bonds(big).map(([i, j]) => distance(big[i]!, big[j]!))
    expect(Math.min(...d)).toBeGreaterThan(1.55)
    expect(Math.min(...d)).toBeLessThan(1.65)
  })
  it('gives every silicon in quartz four oxygens once the neighbouring cells are added', () => {
    const cif = load('quartz')
    const cell = buildCell(cif)
    const all = withNeighbours(cif, cell)
    expect(all.length).toBeGreaterThan(cell.length)
    const b = bonds(all)
    for (let i = 0; i < cell.length; i++) {
      if (cell[i]!.element !== 'Si') continue
      const o = b.filter(([p, q]) => p === i || q === i).length
      expect(o, `Si ${i}`).toBe(4)
    }
  })
  it('builds fluorite with 4 Ca and 8 F', () => {
    const atoms = buildCell(load('fluorite'))
    expect(count(atoms, 'Ca')).toBe(4)
    expect(count(atoms, 'F')).toBe(8)
  })
})
