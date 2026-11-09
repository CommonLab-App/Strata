import { seeded } from '../random'

/**
 * The Geologic Time Builder's model: a cross-section as columns of rock, built by applying events in order. The
 * generator records the true order, so a learner's ordering can be scored and the rule each wrong pair breaks
 * can be named. Geometry is deliberately simple: beds are horizontal when laid, tilting adds a slope across the
 * section, faults drop everything left of a line, erosion planes the surface flat, dikes fill a vertical slot up to
 * the surface of their day. Everything is per column, so later events offset earlier features for free.
 */
export const COLUMNS = 48

export type EventKind = 'bed' | 'dike' | 'fault' | 'tilt' | 'erosion'

export interface StrataEvent {
  id: string
  kind: EventKind
  label: string
}

export interface Segment {
  /** Event id of the bed or dike this rock belongs to. */
  id: string
  bottom: number
  top: number
}

export interface Column {
  rock: Segment[]
  dikes: Segment[]
}

export interface Surface {
  /** Erosion event id. */
  id: string
  /** Height of the planed surface in each column, after the erosion. */
  heights: number[]
  /** Angular where the beds below were tilted since the last erosion; a disconformity otherwise. */
  type: 'angular' | 'disconformity'
}

export interface FaultLine {
  id: string
  /** Column boundary, 1 to COLUMNS - 1; columns left of it dropped. */
  x: number
  bottom: number
  top: number
  drop: number
}

export interface Section {
  seed: number
  events: StrataEvent[]
  columns: Column[]
  faults: FaultLine[]
  surfaces: Surface[]
  /** Tilt applied since the last erosion, for classifying the next unconformity. */
  tiltedSinceErosion: boolean
}

export const LITHOLOGIES = [
  { name: 'sandstone', colour: '#e9c46a' },
  { name: 'shale', colour: '#8d99ae' },
  { name: 'limestone', colour: '#cfd8dc' },
  { name: 'conglomerate', colour: '#b5838d' },
  { name: 'siltstone', colour: '#d4a373' },
  { name: 'mudstone', colour: '#6d6875' },
] as const

export const DIKE_COLOUR = '#3a3a3a'

export const emptySection = (seed: number): Section => ({ seed, events: [], columns: Array.from({ length: COLUMNS }, () => ({ rock: [], dikes: [] })), faults: [], surfaces: [], tiltedSinceErosion: false })

const surfaceOf = (column: Column) => Math.max(0, ...column.rock.map((s) => s.top), ...column.dikes.map((s) => s.top))
export const surfaces = (section: Section) => section.columns.map(surfaceOf)

/** Removes rock above `level` in a column; drops segments that vanish. */
const planeColumn = (column: Column, level: number): Column => ({
  rock: column.rock.flatMap((s) => (s.bottom >= level ? [] : [{ ...s, top: Math.min(s.top, level) }])),
  dikes: column.dikes.flatMap((s) => (s.bottom >= level ? [] : [{ ...s, top: Math.min(s.top, level) }])),
})

export type Action = { kind: 'bed'; lithology: number; thickness: number } | { kind: 'dike'; x: number; width: number } | { kind: 'fault'; x: number; drop: number } | { kind: 'tilt'; slope: number } | { kind: 'erosion' }

/** Applies one event and returns the new section with it appended to the record. */
export function apply(section: Section, action: Action): Section {
  const n = section.events.length + 1
  const count = (kind: EventKind) => section.events.filter((e) => e.kind === kind).length + 1
  const tops = surfaces(section)
  switch (action.kind) {
    case 'bed': {
      const lith = LITHOLOGIES[action.lithology % LITHOLOGIES.length]!
      const id = `bed-${n}`
      const level = Math.max(...tops) + action.thickness
      // A bed fills every column up to one level: it lies flat on whatever surface it finds, so it is thickest where the surface was low.
      const columns = section.columns.map((c, i) => (tops[i]! < level ? { ...c, rock: [...c.rock, { id, bottom: tops[i]!, top: level }] } : c))
      return { ...section, columns, events: [...section.events, { id, kind: 'bed', label: `Bed ${letter(count('bed'))}, ${lith.name}` }] }
    }
    case 'dike': {
      const id = `dike-${n}`
      const columns = section.columns.map((c, i) => (i >= action.x && i < action.x + action.width ? { ...c, dikes: [...c.dikes, { id, bottom: -100, top: tops[i]! }] } : c))
      return { ...section, columns, events: [...section.events, { id, kind: 'dike', label: `Dike ${count('dike')}` }] }
    }
    case 'fault': {
      const id = `fault-${n}`
      const shift = (s: Segment) => ({ ...s, bottom: s.bottom - action.drop, top: s.top - action.drop })
      const columns = section.columns.map((c, i) => (i < action.x ? { rock: c.rock.map(shift), dikes: c.dikes.map(shift) } : c))
      const top = Math.max(tops[action.x - 1] ?? 0, tops[action.x] ?? 0)
      // Earlier erosion surfaces are rock boundaries too, so they drop with the block.
      const surfs = section.surfaces.map((u) => ({ ...u, heights: u.heights.map((h, i) => (i < action.x ? h - action.drop : h)) }))
      return { ...section, columns, surfaces: surfs, faults: [...section.faults, { id, x: action.x, bottom: -100, top, drop: action.drop }], events: [...section.events, { id, kind: 'fault', label: `Fault ${count('fault')}` }] }
    }
    case 'tilt': {
      const id = `tilt-${n}`
      const lift = (i: number) => action.slope * (i - COLUMNS / 2)
      const columns = section.columns.map((c, i) => ({ rock: c.rock.map((s) => ({ ...s, bottom: s.bottom + lift(i), top: s.top + lift(i) })), dikes: c.dikes.map((s) => ({ ...s, bottom: s.bottom + lift(i), top: s.top + lift(i) })) }))
      const faults = section.faults.map((f) => ({ ...f, top: f.top + lift(f.x) }))
      const surfs = section.surfaces.map((u) => ({ ...u, heights: u.heights.map((h, i) => h + lift(i)) }))
      return { ...section, columns, faults, surfaces: surfs, tiltedSinceErosion: true, events: [...section.events, { id, kind: 'tilt', label: `Tilting ${count('tilt')}` }] }
    }
    case 'erosion': {
      const id = `erosion-${n}`
      // Plane down to a level that cuts into the highest ground but leaves the lowest.
      const level = Math.min(...tops) + 0.35 * (Math.max(...tops) - Math.min(...tops))
      const columns = section.columns.map((c) => planeColumn(c, level))
      const faults = section.faults.map((f) => ({ ...f, top: Math.min(f.top, level) }))
      const surface: Surface = { id, heights: columns.map(surfaceOf), type: section.tiltedSinceErosion ? 'angular' : 'disconformity' }
      return { ...section, columns, faults, surfaces: [...section.surfaces, surface], tiltedSinceErosion: false, events: [...section.events, { id, kind: 'erosion', label: `Erosion surface ${count('erosion')}` }] }
    }
  }
}

const letter = (i: number) => String.fromCharCode(64 + i)

/** A teaching section from a seed: beds, a tilt and erosion, dikes, a fault, a second erosion, more beds. Same seed, same section. */
export function generate(seed: number): Section {
  const random = seeded(seed)
  const pick = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1))
  let s = emptySection(seed)
  const beds = (n: number) => {
    for (let i = 0; i < n; i++) s = apply(s, { kind: 'bed', lithology: pick(0, LITHOLOGIES.length - 1), thickness: 1.5 + random() * 1.5 })
  }
  beds(pick(2, 3))
  if (random() < 0.6) {
    s = apply(s, { kind: 'tilt', slope: (random() < 0.5 ? -1 : 1) * (0.08 + random() * 0.06) })
    s = apply(s, { kind: 'erosion' })
    beds(pick(1, 2))
  }
  if (random() < 0.85) s = apply(s, { kind: 'dike', x: pick(6, 18), width: pick(2, 3) })
  if (random() < 0.75) s = apply(s, { kind: 'fault', x: pick(20, 34), drop: 1.5 + random() * 1.5 })
  if (random() < 0.6) {
    s = apply(s, { kind: 'erosion' })
    beds(pick(1, 2))
  } else beds(1)
  if (random() < 0.5) s = apply(s, { kind: 'dike', x: pick(30, 42), width: 2 })
  return s
}

/** The events in a shuffled order for the learner to sort, the same shuffle for the same seed. */
export function shuffled(section: Section): StrataEvent[] {
  const random = seeded(section.seed ^ 0x9e3779b9)
  const out = [...section.events]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/** Why one event must come before another, named for the first wrong pair. */
export function ruleBetween(older: StrataEvent, younger: StrataEvent): string {
  if (older.kind === 'bed' && younger.kind === 'bed') return `Superposition: ${older.label} lies beneath ${younger.label}, so it was laid down first.`
  if (younger.kind === 'dike' || younger.kind === 'fault') return `Cross-cutting: ${younger.label} cuts ${older.label}, so it is the younger of the two.`
  if (older.kind === 'dike' || older.kind === 'fault') return `${younger.label} covers or truncates ${older.label}, so ${older.label} came first.`
  if (older.kind === 'tilt') return `${younger.label} lies flat across the tilted beds, so the tilting came first.`
  if (younger.kind === 'tilt') return `${older.label} is tilted, so it was there before the tilting.`
  if (older.kind === 'erosion') return `${older.label} is cut into older rock and covered by ${younger.label}.`
  return `${older.label} is truncated by ${younger.label}, so it came first.`
}

export interface OrderScore {
  /** Fraction of event pairs in the right order, 0 to 1. */
  pairs: number
  /** The first adjacent pair out of order, and the rule it breaks; null when the order is right. */
  broken: { first: StrataEvent; second: StrataEvent; rule: string } | null
}

export function scoreOrder(section: Section, order: readonly string[]): OrderScore {
  const truth = new Map(section.events.map((e, i) => [e.id, i]))
  const rank = (id: string) => truth.get(id) ?? -1
  let right = 0
  let total = 0
  for (let i = 0; i < order.length; i++)
    for (let j = i + 1; j < order.length; j++) {
      total++
      if (rank(order[i]!) < rank(order[j]!)) right++
    }
  let broken: OrderScore['broken'] = null
  for (let i = 0; i + 1 < order.length && broken === null; i++) {
    const a = section.events.find((e) => e.id === order[i])
    const b = section.events.find((e) => e.id === order[i + 1])
    if (a && b && rank(a.id) > rank(b.id)) broken = { first: a, second: b, rule: ruleBetween(b, a) }
  }
  return { pairs: total === 0 ? 1 : right / total, broken }
}
