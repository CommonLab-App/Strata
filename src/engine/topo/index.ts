import { seeded } from '../random'

/** A bundled elevation grid: `heights[row][col]` in metres, row 0 at the north edge, with the cell size in metres. */
export interface Grid {
  size: number
  heights: number[][]
  /** metres per cell, east-west and north-south */
  dx: number
  dy: number
}

export const sample = (g: Grid, col: number, row: number): number => {
  const c = Math.max(0, Math.min(g.size - 1.001, col))
  const r = Math.max(0, Math.min(g.size - 1.001, row))
  const c0 = Math.floor(c)
  const r0 = Math.floor(r)
  const fc = c - c0
  const fr = r - r0
  const h = (rr: number, cc: number) => g.heights[rr]![cc]!
  return (1 - fr) * ((1 - fc) * h(r0, c0) + fc * h(r0, c0 + 1)) + fr * ((1 - fc) * h(r0 + 1, c0) + fc * h(r0 + 1, c0 + 1))
}

export type Point = [number, number]

/** Contour lines at `level` as polylines in grid coordinates (col, row), by marching squares with the segments joined. */
export function contour(g: Grid, level: number): Point[][] {
  const segs: [Point, Point][] = []
  const lerp = (a: number, b: number) => (level - a) / (b - a)
  for (let r = 0; r < g.size - 1; r++)
    for (let c = 0; c < g.size - 1; c++) {
      const tl = g.heights[r]![c]!
      const tr = g.heights[r]![c + 1]!
      const br = g.heights[r + 1]![c + 1]!
      const bl = g.heights[r + 1]![c]!
      const idx = (tl >= level ? 8 : 0) | (tr >= level ? 4 : 0) | (br >= level ? 2 : 0) | (bl >= level ? 1 : 0)
      if (idx === 0 || idx === 15) continue
      const top: Point = [c + lerp(tl, tr), r]
      const right: Point = [c + 1, r + lerp(tr, br)]
      const bottom: Point = [c + lerp(bl, br), r + 1]
      const left: Point = [c, r + lerp(tl, bl)]
      const table: Record<number, [Point, Point][]> = {
        1: [[left, bottom]],
        2: [[bottom, right]],
        3: [[left, right]],
        4: [[top, right]],
        5: [[left, top], [bottom, right]],
        6: [[top, bottom]],
        7: [[left, top]],
        8: [[left, top]],
        9: [[top, bottom]],
        10: [[left, bottom], [top, right]],
        11: [[top, right]],
        12: [[left, right]],
        13: [[bottom, right]],
        14: [[left, bottom]],
      }
      for (const s of table[idx] ?? []) segs.push(s)
    }
  return join(segs)
}

const key = (p: Point) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`

/** Joins segments end to end into polylines. */
function join(segs: [Point, Point][]): Point[][] {
  const ends = new Map<string, number[]>()
  segs.forEach((s, i) => {
    for (const p of s) {
      const k = key(p)
      ends.set(k, [...(ends.get(k) ?? []), i])
    }
  })
  const used = new Array<boolean>(segs.length).fill(false)
  const lines: Point[][] = []
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue
    used[i] = true
    const line: Point[] = [segs[i]![0], segs[i]![1]]
    for (const dir of [1, -1] as const) {
      for (;;) {
        const end = dir === 1 ? line[line.length - 1]! : line[0]!
        const next = (ends.get(key(end)) ?? []).find((j) => !used[j])
        if (next === undefined) break
        used[next] = true
        const [a, b] = segs[next]!
        const other = key(a) === key(end) ? b : a
        if (dir === 1) line.push(other)
        else line.unshift(other)
      }
    }
    lines.push(line)
  }
  return lines
}

/** Contour levels at `interval` covering the grid's range. */
export function levels(g: Grid, interval: number): number[] {
  const flat = g.heights.flat()
  const lo = Math.ceil(Math.min(...flat) / interval) * interval
  const hi = Math.floor(Math.max(...flat) / interval) * interval
  const out: number[] = []
  for (let v = lo; v <= hi; v += interval) out.push(v)
  return out
}

/** Elevations at `n` evenly spaced stations from a to b (inclusive), with the distance in metres along the line. */
export function profile(g: Grid, a: Point, b: Point, n: number): { metres: number; elevation: number }[] {
  const length = lengthMetres(g, a, b)
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1)
    return { metres: t * length, elevation: sample(g, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t) }
  })
}

export const lengthMetres = (g: Grid, a: Point, b: Point) => Math.hypot((b[0] - a[0]) * g.dx, (b[1] - a[1]) * g.dy)

/** Average gradient between two points in metres of rise per kilometre of run (signed, a to b). */
export const gradient = (g: Grid, a: Point, b: Point) => ((sample(g, b[0], b[1]) - sample(g, a[0], a[1])) / lengthMetres(g, a, b)) * 1000

/** Strike (right-hand rule, 0 to 360) and dip (0 to 90) of the plane through three points, x east and y north in metres. */
export function threePoint(p: [number, number, number][]): { strike: number; dip: number } {
  const [a, b, c] = p
  if (!a || !b || !c) throw new Error('need three points')
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
  let n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!]
  if (n[2]! < 0) n = n.map((x) => -x)
  const horizontal = Math.hypot(n[0]!, n[1]!)
  const dip = (Math.atan2(horizontal, n[2]!) * 180) / Math.PI
  if (horizontal < 1e-9) return { strike: 0, dip: 0 }
  // The upward normal leans toward the downhill side, so the plane dips toward n_h; strike is 90° anticlockwise of
  // the dip direction (dip to the right of strike).
  const dipDirection = ((Math.atan2(n[0]!, n[1]!) * 180) / Math.PI + 360) % 360
  return { strike: (dipDirection + 270) % 360, dip }
}

/** Smallest difference between two azimuths, allowing the two ends of a strike line. */
export const strikeDifference = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 180) + 180) % 180
  return Math.min(d, 180 - d)
}

export interface TopoTask {
  area: number
  line: [Point, Point]
  stations: number
  /** Three outcrop points of one planar bed: x east, y north (metres from the first), elevation. */
  outcrops: [number, number, number][]
  truth: { strike: number; dip: number }
}

/** A seeded task: a profile line across the grid and a three-point problem on a plane of random strike and dip. */
export function task(seed: number, areas: number): TopoTask {
  const random = seeded(seed)
  const pick = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1))
  const line: [Point, Point] = [[pick(8, 40), pick(8, 119)], [pick(88, 119), pick(8, 119)]]
  const strike = pick(0, 359)
  const dip = pick(5, 60)
  const dipDir = ((strike + 90) % 360) * (Math.PI / 180)
  const z0 = pick(200, 800)
  const outcrops = [0, 1, 2].map((): [number, number, number] => {
    const x = pick(-400, 400)
    const y = pick(-400, 400)
    const along = x * Math.sin(dipDir) + y * Math.cos(dipDir)
    return [x, y, Math.round(z0 - along * Math.tan((dip * Math.PI) / 180))]
  })
  return { area: pick(0, areas - 1), line, stations: 5, outcrops, truth: { strike, dip } }
}

export const TOPO_TOLERANCE = { gradientRelative: 0.1, strikeDeg: 10, dipDeg: 5 }
