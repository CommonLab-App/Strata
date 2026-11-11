import type { ReactElement } from 'react'

/**
 * Pieces for the looping block diagrams (docs/specs/models.md): brand colours and the materials mixed from them,
 * cabinet-projection slabs, hatch patterns, motion arrows and labels. Scenes are hand-placed with these; there is
 * no scene graph.
 */

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))

/** `t` of the way from `from` toward `toward`, as '#rrggbb'. */
export const mix = (from: string, toward: string, t: number): string => {
  const a = rgb(from)
  const b = rgb(toward)
  return `#${a.map((c, i) => hex(c + ((b[i] ?? c) - c) * t)).join('')}`
}

const BASEMENT = '#1B1816'
const CHALK = '#FAF6EE'
const SLATE = '#2E2A2B'
const MAGMA = '#C4432B'
const SANDSTONE = '#DDA247'
const SHALE = '#8E8FB7'
const LIMESTONE = '#F0E1AE'
const MUDSTONE = '#E59C86'
const GREENSAND = '#9DB97A'
const SHALE_DEEP = '#5E5F86'

/** Fixed fills, the same in every topic and in dark mode (as the brand hero SVG does). Text uses currentColor. */
export const MATERIAL = {
  basement: BASEMENT,
  chalk: CHALK,
  magma: MAGMA,
  sandstone: SANDSTONE,
  shale: SHALE,
  limestone: LIMESTONE,
  mudstone: MUDSTONE,
  greensand: GREENSAND,
  shaleDeep: SHALE_DEEP,
  crust: mix(SANDSTONE, CHALK, 0.15),
  oceanCrust: mix(SHALE_DEEP, BASEMENT, 0.25),
  mantle: mix(MUDSTONE, MAGMA, 0.3),
  soil: mix(SANDSTONE, BASEMENT, 0.55),
  ash: mix(SLATE, CHALK, 0.35),
  debris: mix(SANDSTONE, BASEMENT, 0.3),
  water: '#5B8FBF',
  ice: mix(CHALK, SHALE_DEEP, 0.08),
  vegetation: mix(GREENSAND, CHALK, 0.1),
} as const

/** Cabinet projection: one unit of depth goes 0.62 right and 0.36 up. */
export const DEPTH = { dx: 0.62, dy: -0.36 } as const

const pts = (p: [number, number][]) => p.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ')

/** The three visible faces of a slab whose front-left-top corner is (x, y): width w, height h, depth d going back. */
export const block = (x: number, y: number, w: number, h: number, d: number) => {
  const ox = d * DEPTH.dx
  const oy = d * DEPTH.dy
  return {
    front: pts([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]),
    top: pts([[x, y], [x + w, y], [x + w + ox, y + oy], [x + ox, y + oy]]),
    side: pts([[x + w, y], [x + w + ox, y + oy], [x + w + ox, y + oy + h], [x + w, y + h]]),
    topFill: (fill: string) => mix(fill, CHALK, 0.42),
    sideFill: (fill: string) => mix(fill, BASEMENT, 0.22),
  }
}

/** A straight motion arrow from (x1, y1) to (x2, y2) with a filled head, as one path. Stroke and fill the same colour. */
export const arrow = (x1: number, y1: number, x2: number, y2: number, head = 7): string => {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const bx = x2 - head * Math.cos(a)
  const by = y2 - head * Math.sin(a)
  const l = [bx + (head / 2) * Math.sin(a), by - (head / 2) * Math.cos(a)]
  const r = [bx - (head / 2) * Math.sin(a), by + (head / 2) * Math.cos(a)]
  const f = (n: number) => +n.toFixed(2)
  return `M${f(x1)} ${f(y1)}L${f(bx)} ${f(by)}M${f(l[0]!)} ${f(l[1]!)}L${f(x2)} ${f(y2)}L${f(r[0]!)} ${f(r[1]!)}Z`
}

export type Bed = 'sandstone' | 'shale' | 'limestone' | 'greensand'
export const hatch = (prefix: string, bed: Bed) => `url(#${prefix}-${bed})`

/** The brand's four hatch patterns, ids prefixed per scene so two scenes on one page cannot clash. */
export const Patterns = ({ prefix }: { prefix: string }): ReactElement => (
  <defs>
    <pattern id={`${prefix}-limestone`} width="24" height="12" patternUnits="userSpaceOnUse">
      <path d="M0 0.5H24 M0 6.5H24 M6 0.5V6.5 M18 6.5V12.5" stroke={BASEMENT} strokeWidth="0.9" fill="none" opacity="0.33" />
    </pattern>
    <pattern id={`${prefix}-sandstone`} width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2.5" cy="2.5" r="0.9" fill={BASEMENT} opacity="0.3" />
      <circle cx="7.5" cy="7.5" r="0.9" fill={BASEMENT} opacity="0.3" />
    </pattern>
    <pattern id={`${prefix}-shale`} width="18" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 2.5H11 M9 6.5H20" stroke={BASEMENT} strokeWidth="0.9" opacity="0.3" />
    </pattern>
    <pattern id={`${prefix}-greensand`} width="16" height="12" patternUnits="userSpaceOnUse">
      <path d="M3 3 l2 -2 M11 9 l2 -2" stroke={BASEMENT} strokeWidth="0.9" opacity="0.27" />
    </pattern>
  </defs>
)

/** Outline style shared by every face: 1.6 Basement at 90 %. */
export const OUTLINE = { fill: 'none', stroke: BASEMENT, strokeWidth: 1.6, strokeLinejoin: 'round', opacity: 0.9 } as const

/** A label with a leader line from (x, y) on the drawing to the text at (lx, ly). Tappable: carries the part id. 13 units reads as 10 px on a phone. */
export const Label = ({ x, y, lx, ly, part, children, anchor = 'start' }: { x: number; y: number; lx: number; ly: number; part: string; children: string; anchor?: 'start' | 'middle' | 'end' }): ReactElement => (
  <g data-part={part}>
    <line x1={x} y1={y} x2={lx} y2={ly} stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
    <text x={lx} y={ly} fontSize={13} fill="currentColor" textAnchor={anchor} dominantBaseline="middle" dx={anchor === 'end' ? -3 : anchor === 'start' ? 3 : 0}>
      {children}
    </text>
  </g>
)
