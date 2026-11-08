/**
 * A small CIF reader: enough of the format for crystal structures from the Crystallography Open Database. Reads
 * the first data block's cell, symmetry operations and atom sites. Pure and deterministic.
 */

export interface Cell {
  a: number
  b: number
  c: number
  alpha: number
  beta: number
  gamma: number
}

export interface Site {
  label: string
  element: string
  /** Fractional coordinates. */
  x: number
  y: number
  z: number
  occupancy: number
}

export interface Cif {
  name: string | null
  formula: string | null
  spaceGroup: string | null
  cell: Cell
  /** Symmetry operations as CIF writes them, e.g. "-x+1/2,y,-z". Always includes the identity. */
  symmetry: string[]
  sites: Site[]
}

/** Splits a CIF body into tokens: bare words, quoted strings, and semicolon text fields; comments dropped. */
function tokenize(text: string): string[] {
  const tokens: string[] = []
  const lines = text.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (line.startsWith(';')) {
      const parts = [line.slice(1)]
      i++
      while (i < lines.length && !(lines[i] ?? '').startsWith(';')) {
        parts.push(lines[i] ?? '')
        i++
      }
      tokens.push(parts.join('\n'))
      i++
      continue
    }
    const re = /'([^']*(?:'(?=\S)[^']*)*)'(?=\s|$)|"([^"]*)"(?=\s|$)|(#.*$)|(\S+)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(line))) {
      if (m[3] !== undefined) break
      tokens.push(m[1] ?? m[2] ?? m[4] ?? '')
    }
    i++
  }
  return tokens
}

/** A CIF number such as "1.234(5)" or "0.5"; NaN for "." and "?". */
export const cifNumber = (s: string): number => {
  if (s === '.' || s === '?') return NaN
  return Number(s.replace(/\(\d+\)$/, ''))
}

const ELEMENT = /^([A-Z][a-z]?)/

export function parseCif(text: string): Cif {
  const tokens = tokenize(text)
  const items = new Map<string, string>()
  const loops: Map<string, string[]>[] = []
  let i = tokens.findIndex((t) => t.toLowerCase().startsWith('data_'))
  if (i < 0) throw new Error('no data block')
  i++
  while (i < tokens.length) {
    const t = tokens[i] ?? ''
    if (t.toLowerCase().startsWith('data_')) break
    if (t.toLowerCase() === 'loop_') {
      i++
      const names: string[] = []
      while (i < tokens.length && (tokens[i] ?? '').startsWith('_')) {
        names.push((tokens[i] ?? '').toLowerCase())
        i++
      }
      const cols = new Map(names.map((n) => [n, [] as string[]]))
      let k = 0
      while (i < tokens.length && !(tokens[i] ?? '').startsWith('_') && (tokens[i] ?? '').toLowerCase() !== 'loop_' && !(tokens[i] ?? '').toLowerCase().startsWith('data_')) {
        cols.get(names[k % names.length] ?? '')?.push(tokens[i] ?? '')
        k++
        i++
      }
      loops.push(cols)
      continue
    }
    if (t.startsWith('_')) {
      items.set(t.toLowerCase(), tokens[i + 1] ?? '')
      i += 2
      continue
    }
    i++
  }

  const num = (key: string) => cifNumber(items.get(key) ?? '?')
  const cell: Cell = { a: num('_cell_length_a'), b: num('_cell_length_b'), c: num('_cell_length_c'), alpha: num('_cell_angle_alpha'), beta: num('_cell_angle_beta'), gamma: num('_cell_angle_gamma') }
  if (Object.values(cell).some((v) => Number.isNaN(v))) throw new Error('incomplete cell')

  const loopWith = (key: string) => loops.find((l) => l.has(key))
  const symLoop = loopWith('_symmetry_equiv_pos_as_xyz') ?? loopWith('_space_group_symop_operation_xyz')
  const symmetry = (symLoop?.get('_symmetry_equiv_pos_as_xyz') ?? symLoop?.get('_space_group_symop_operation_xyz') ?? ['x,y,z']).map((s) => s.replace(/\s+/g, '').toLowerCase())
  if (!symmetry.includes('x,y,z')) symmetry.unshift('x,y,z')

  const siteLoop = loopWith('_atom_site_fract_x')
  if (!siteLoop) throw new Error('no atom sites')
  const col = (k: string) => siteLoop.get(k)
  const labels = col('_atom_site_label') ?? []
  const types = col('_atom_site_type_symbol')
  const occ = col('_atom_site_occupancy')
  const xs = col('_atom_site_fract_x') ?? []
  const ys = col('_atom_site_fract_y') ?? []
  const zs = col('_atom_site_fract_z') ?? []
  const sites: Site[] = xs
    .map((_, k) => {
      const label = labels[k] ?? `X${k}`
      const element = ELEMENT.exec(types?.[k] ?? label)?.[1] ?? 'X'
      return { label, element, x: cifNumber(xs[k] ?? '?'), y: cifNumber(ys[k] ?? '?'), z: cifNumber(zs[k] ?? '?'), occupancy: occ ? cifNumber(occ[k] ?? '1') : 1 }
    })
    .filter((s) => ![s.x, s.y, s.z].some(Number.isNaN))

  const str = (key: string) => {
    const v = items.get(key)
    return v === undefined || v === '?' || v === '.' ? null : v.trim()
  }
  return {
    name: str('_chemical_name_mineral'),
    formula: str('_chemical_formula_sum'),
    spaceGroup: str('_symmetry_space_group_name_h-m') ?? str('_space_group_name_h-m_alt'),
    cell,
    symmetry,
    sites,
  }
}
