import type { Cell, Cif } from './cif'

export interface Atom {
  element: string
  /** Fractional, in [0, 1). */
  frac: [number, number, number]
  /** Cartesian, Å. */
  xyz: [number, number, number]
}

/** Evaluates one component of a symmetry operation, e.g. "-x+1/2" or "y-x", at a fractional position. */
export function applyOp(op: string, p: [number, number, number]): [number, number, number] {
  const parts = op.split(',')
  if (parts.length !== 3) throw new Error(`bad symmetry op ${op}`)
  const value = (expr: string): number => {
    let total = 0
    // Terms are signed: "+x", "-1/2", "+2y" (rare), "-z".
    for (const m of expr.matchAll(/([+-]?)(\d+(?:\.\d+)?(?:\/\d+)?)?([xyz])?/g)) {
      const [whole, sign, coef, variable] = m
      if (!whole) continue
      let c = coef ? (coef.includes('/') ? Number(coef.split('/')[0]) / Number(coef.split('/')[1]) : Number(coef)) : 1
      if (!coef && !variable) continue
      if (sign === '-') c = -c
      total += variable ? c * p['xyz'.indexOf(variable) as 0 | 1 | 2] : c
    }
    return total
  }
  return [value(parts[0] ?? ''), value(parts[1] ?? ''), value(parts[2] ?? '')]
}

const wrap = (v: number) => {
  const w = v - Math.floor(v)
  return w > 1 - 1e-6 ? 0 : w
}

/** Fractional to Cartesian, with a along x and b in the xy plane. */
export function toCartesian(cell: Cell, f: [number, number, number]): [number, number, number] {
  const rad = Math.PI / 180
  const ca = Math.cos(cell.alpha * rad)
  const cb = Math.cos(cell.beta * rad)
  const cg = Math.cos(cell.gamma * rad)
  const sg = Math.sin(cell.gamma * rad)
  const v = Math.sqrt(1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg)
  const x = cell.a * f[0] + cell.b * cg * f[1] + cell.c * cb * f[2]
  const y = cell.b * sg * f[1] + (cell.c * (ca - cb * cg)) / sg * f[2]
  const z = ((cell.c * v) / sg) * f[2]
  return [x, y, z]
}

/** Every atom in one unit cell: each site under each symmetry operation, wrapped into the cell, duplicates merged. */
export function buildCell(cif: Cif): Atom[] {
  const atoms: Atom[] = []
  for (const site of cif.sites) {
    for (const op of cif.symmetry) {
      const frac = applyOp(op, [site.x, site.y, site.z]).map(wrap) as [number, number, number]
      const near = (v: number, w: number) => Math.abs(v - w) < 1e-3 || Math.abs(Math.abs(v - w) - 1) < 1e-3
      const dup = atoms.some((a) => a.element === site.element && near(frac[0], a.frac[0]) && near(frac[1], a.frac[1]) && near(frac[2], a.frac[2]))
      if (!dup) atoms.push({ element: site.element, frac, xyz: toCartesian(cif.cell, frac) })
    }
  }
  return atoms
}

/** The cell repeated n times along each axis, so bonds across cell edges can be seen. */
export function repeatCell(cif: Cif, atoms: Atom[], n: number): Atom[] {
  const out: Atom[] = []
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++)
        for (const a of atoms) {
          const frac: [number, number, number] = [a.frac[0] + i, a.frac[1] + j, a.frac[2] + k]
          out.push({ element: a.element, frac, xyz: toCartesian(cif.cell, frac) })
        }
  return out
}

/** Covalent radii in Å for the elements the library's minerals hold (Cordero et al. 2008, rounded). */
export const COVALENT_RADIUS: Record<string, number> = {
  H: 0.31, C: 0.76, O: 0.66, F: 0.57, Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05, Cl: 1.02, K: 2.03, Ca: 1.76, Ti: 1.6, Mn: 1.39, Fe: 1.32, Cu: 1.32, Zn: 1.22, Pb: 1.46, Ba: 2.15, Hg: 1.32, Mo: 1.54, Sb: 1.39, Zr: 1.75, Be: 0.96, B: 0.84,
}

/** Pairs closer than the sum of their covalent radii times `tolerance`. Ionic bonds (Na–Cl) need a looser tolerance than covalent ones. */
export function bonds(atoms: Atom[], tolerance = 1.25): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i]!
      const b = atoms[j]!
      const cutoff = ((COVALENT_RADIUS[a.element] ?? 1.5) + (COVALENT_RADIUS[b.element] ?? 1.5)) * tolerance
      const d = Math.hypot(a.xyz[0] - b.xyz[0], a.xyz[1] - b.xyz[1], a.xyz[2] - b.xyz[2])
      if (d > 0.4 && d <= cutoff) out.push([i, j])
    }
  }
  return out
}

export const distance = (a: Atom, b: Atom) => Math.hypot(a.xyz[0] - b.xyz[0], a.xyz[1] - b.xyz[1], a.xyz[2] - b.xyz[2])
