import { useState, type PointerEvent } from 'react'

export interface Series {
  id: string
  label: string
  /** [x, y] pairs, in axis units. */
  points: [number, number][]
  colour?: string
}

export interface Axis {
  label: string
  unit?: string
  min?: number
  max?: number
  log?: boolean
}

const W = 320
const H = 200
const PAD = { left: 44, right: 12, top: 10, bottom: 34 }

/** Round tick positions covering [lo, hi], about `n` of them. */
export function ticks(lo: number, hi: number, n = 5): number[] {
  if (!(hi > lo)) return [lo]
  const raw = (hi - lo) / n
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag
  const out: number[] = []
  for (let t = Math.ceil(lo / step) * step; t <= hi + step / 1e6; t += step) out.push(Number((Math.round(t / step) * step).toPrecision(12)))
  return out
}

const extent = (axis: Axis, values: number[]): [number, number] => {
  const lo = axis.min ?? Math.min(...values)
  const hi = axis.max ?? Math.max(...values)
  return lo === hi ? [lo - 1, hi + 1] : [lo, hi]
}
const fmt = (v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(0) : String(Math.round(v * 100) / 100))

/**
 * One SVG plot: series as polylines, a marker for the current state, a cursor readout on hover or touch. Pure
 * drawing; no chart library, no animation (so it needs no reduced-motion branch).
 */
export function Plot({ series, x, y, marker, title }: { series: Series[]; x: Axis; y: Axis; marker?: [number, number]; title: string }) {
  const [cursor, setCursor] = useState<[number, number] | null>(null)
  const all = series.flatMap((s) => s.points)
  const [x0, x1] = extent(x, all.map((p) => p[0]).concat(marker ? [marker[0]] : []))
  const [y0, y1] = extent(y, all.map((p) => p[1]).concat(marker ? [marker[1]] : []))
  const tx = (v: number) => (x.log ? Math.log10(v) : v)
  const ty = (v: number) => (y.log ? Math.log10(v) : v)
  const sx = (v: number) => PAD.left + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (W - PAD.left - PAD.right)
  const sy = (v: number) => H - PAD.bottom - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (H - PAD.top - PAD.bottom)
  const xt = x.log ? ticks(Math.log10(x0), Math.log10(x1)).map((t) => 10 ** t) : ticks(x0, x1)
  const yt = y.log ? ticks(Math.log10(y0), Math.log10(y1)).map((t) => 10 ** t) : ticks(y0, y1)

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const first = series[0]
    if (!first || first.points.length === 0) return
    let best = first.points[0]!
    for (const p of first.points) if (Math.abs(sx(p[0]) - px) < Math.abs(sx(best[0]) - px)) best = p
    setCursor(best)
  }

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full touch-none select-none text-xs" onPointerMove={onMove} onPointerLeave={() => setCursor(null)}>
        {xt.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={PAD.top} y2={H - PAD.bottom} stroke="currentColor" strokeOpacity={0.12} />
            <text x={sx(t)} y={H - PAD.bottom + 14} textAnchor="middle" fill="currentColor">
              {fmt(t)}
            </text>
          </g>
        ))}
        {yt.map((t) => (
          <g key={`y${t}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={sy(t)} y2={sy(t)} stroke="currentColor" strokeOpacity={0.12} />
            <text x={PAD.left - 6} y={sy(t) + 3} textAnchor="end" fill="currentColor">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={(PAD.left + W - PAD.right) / 2} y={H - 4} textAnchor="middle" fill="currentColor">
          {x.label}
          {x.unit ? ` (${x.unit})` : ''}
        </text>
        <text transform={`translate(10 ${(PAD.top + H - PAD.bottom) / 2}) rotate(-90)`} textAnchor="middle" fill="currentColor">
          {y.label}
          {y.unit ? ` (${y.unit})` : ''}
        </text>
        {series.map((s) => (
          <polyline key={s.id} fill="none" stroke={s.colour ?? 'var(--color-brand)'} strokeWidth={2} points={s.points.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} />
        ))}
        {marker && <circle cx={sx(marker[0])} cy={sy(marker[1])} r={5} fill="var(--color-brand)" stroke="white" strokeWidth={1.5} />}
        {cursor && (
          <g>
            <line x1={sx(cursor[0])} x2={sx(cursor[0])} y1={PAD.top} y2={H - PAD.bottom} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="3 3" />
            <circle cx={sx(cursor[0])} cy={sy(cursor[1])} r={3} fill="currentColor" />
          </g>
        )}
      </svg>
      <figcaption className="text-muted-foreground min-h-5 text-xs tabular-nums">
        {cursor ? `${x.label} ${fmt(cursor[0])}${x.unit ? ` ${x.unit}` : ''}, ${y.label} ${fmt(cursor[1])}${y.unit ? ` ${y.unit}` : ''}` : series.map((s) => s.label).join(' · ')}
      </figcaption>
    </figure>
  )
}
