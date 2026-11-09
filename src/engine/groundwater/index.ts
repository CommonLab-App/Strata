import { seeded } from '../random'
import { contour, sample, type Grid, type Point } from '../topo'

/**
 * Groundwater for week 14: Darcy's law, the Thiem steady-state cone of depression, and a water table interpolated
 * from well heads for contouring and flow direction. SI units throughout.
 */

/** Darcy: discharge Q = K · A · i, with K in m/day, A in m², i dimensionless (head drop over distance). */
export const darcy = (k: number, area: number, gradient: number) => k * area * gradient

/**
 * Thiem (confined, steady state): drawdown at radius r from a well pumping Q with transmissivity T and radius of
 * influence R. s = Q ln(R / r) / (2 π T). Q in m³/day, T in m²/day, lengths in m.
 */
export const thiemDrawdown = (q: number, t: number, radiusOfInfluence: number, r: number) => (q * Math.log(radiusOfInfluence / r)) / (2 * Math.PI * t)

export interface Well {
  /** metres east and north of the map's south-west corner */
  x: number
  y: number
  /** hydraulic head, metres above datum */
  head: number
}

/** A water-table grid from well heads by inverse-distance weighting (power 2), `size` cells over `extent` metres. */
export function waterTable(wells: readonly Well[], extent: number, size = 64): Grid {
  const cell = extent / size
  const heights: number[][] = []
  for (let r = 0; r < size; r++) {
    const row: number[] = []
    const y = extent - (r + 0.5) * cell
    for (let c = 0; c < size; c++) {
      const x = (c + 0.5) * cell
      let num = 0
      let den = 0
      for (const w of wells) {
        const d2 = (w.x - x) ** 2 + (w.y - y) ** 2
        if (d2 < 1e-6) {
          num = w.head
          den = 1
          break
        }
        num += w.head / d2
        den += 1 / d2
      }
      row.push(num / den)
    }
    heights.push(row)
  }
  return { size, heights, dx: cell, dy: cell }
}

/** Head contours at `interval` in map metres (x east, y north). */
export function headContours(grid: Grid, interval: number): { level: number; lines: Point[][] }[] {
  const flat = grid.heights.flat()
  const lo = Math.ceil(Math.min(...flat) / interval) * interval
  const hi = Math.floor(Math.max(...flat) / interval) * interval
  const out: { level: number; lines: Point[][] }[] = []
  for (let level = lo; level <= hi; level += interval) {
    const lines = contour(grid, level).map((poly) => poly.map(([c, r]): Point => [(c + 0.5) * grid.dx, grid.size * grid.dy - (r + 0.5) * grid.dy]))
    out.push({ level, lines })
  }
  return out
}

/** Direction of groundwater flow at a map point: down the steepest head gradient, as an azimuth from north. */
export function flowAzimuth(grid: Grid, x: number, y: number): number {
  const c = x / grid.dx - 0.5
  const r = grid.size - y / grid.dy - 0.5
  // A stencil two cells wide, bilinear at each end, so the bumps of inverse-distance weighting average out.
  const dhdx = (sample(grid, c + 2, r) - sample(grid, c - 2, r)) / (4 * grid.dx)
  const dhdy = (sample(grid, c, r - 2) - sample(grid, c, r + 2)) / (4 * grid.dy)
  return ((Math.atan2(-dhdx, -dhdy) * 180) / Math.PI + 360) % 360
}

export const azimuthDifference = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360) + 360) % 360
  return d > 180 ? 360 - d : d
}

export interface GroundwaterTask {
  extent: number
  wells: Well[]
  /** Where the flow direction and head are asked. */
  point: { x: number; y: number }
  pumping: { q: number; t: number; radiusOfInfluence: number; r: number }
}

/** A seeded task: eight wells on a sloping water table with a bump, a point to read, and a pumping scenario. */
export function task(seed: number): GroundwaterTask {
  const random = seeded(seed)
  const extent = 2000
  const dir = random() * 2 * Math.PI
  const slope = 0.002 + random() * 0.006
  const bumpX = 400 + random() * 1200
  const bumpY = 400 + random() * 1200
  const bump = (random() < 0.5 ? -1 : 1) * (2 + random() * 4)
  const base = 100 + random() * 50
  const wells: Well[] = []
  for (let i = 0; i < 8; i++) {
    const x = 150 + random() * (extent - 300)
    const y = 150 + random() * (extent - 300)
    const along = x * Math.sin(dir) + y * Math.cos(dir)
    const head = base - slope * along + bump * Math.exp(-((x - bumpX) ** 2 + (y - bumpY) ** 2) / (2 * 400 ** 2))
    wells.push({ x: Math.round(x), y: Math.round(y), head: Math.round(head * 10) / 10 })
  }
  return {
    extent,
    wells,
    point: { x: Math.round(500 + random() * 1000), y: Math.round(500 + random() * 1000) },
    pumping: { q: Math.round(200 + random() * 800), t: Math.round(50 + random() * 450), radiusOfInfluence: 500, r: Math.round(10 + random() * 90) },
  }
}

export const GROUNDWATER_TOLERANCE = { headM: 1, azimuthDeg: 20, drawdownRelative: 0.1 }
