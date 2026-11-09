import { useId, useState, type PointerEvent } from 'react'
import type { StationRecord, TeachingEvent } from '@/data/seismograms/schema'

export type Picks = Record<string, { p: number | null; s: number | null }>
export const stationKey = (s: StationRecord) => `${s.net}.${s.sta}`

const W = 640
const H = 72

/**
 * Three vertical-component traces on one time axis, scrubbable: tap or drag in a strip to set the P pick, with the
 * S key held (or the S button chosen) to set the S pick. Times are seconds from each record's first sample, which is
 * the same instant for all three (the records were cut to one window).
 */
export function Seismograms({ event, picks, onPick, readOnly = false }: { event: TeachingEvent; picks: Picks; onPick?: (station: string, which: 'p' | 's', seconds: number) => void; readOnly?: boolean }) {
  const id = useId()
  const [which, setWhich] = useState<'p' | 's'>('p')
  const length = Math.max(...event.stations.map((s) => s.samples.length))
  const x = (t: number) => (t / length) * W

  const place = (e: PointerEvent<SVGSVGElement>, station: StationRecord) => {
    if (readOnly || !onPick || e.buttons === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const t = Math.round((((e.clientX - rect.left) / rect.width) * length) * 2) / 2
    onPick(stationKey(station), which, Math.max(0, Math.min(length, t)))
  }

  return (
    <div className="grid gap-2">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="Which arrival to mark">
          <span className="text-muted-foreground">Mark:</span>
          {(['p', 's'] as const).map((w) => (
            <button key={w} type="button" aria-pressed={which === w} onClick={() => setWhich(w)} className={`rounded-md border px-2 py-0.5 ${which === w ? 'bg-foreground text-background' : ''}`}>
              {w.toUpperCase()} arrival
            </button>
          ))}
          <span className="text-muted-foreground">then tap or drag on a trace.</span>
        </div>
      )}
      {event.stations.map((s) => {
        const key = stationKey(s)
        const pick = picks[key] ?? { p: null, s: null }
        const path = s.samples.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${(H / 2 - v * (H / 2 - 4)).toFixed(1)}`).join(' ')
        return (
          <figure key={key} className="m-0">
            <figcaption className="flex flex-wrap justify-between text-xs text-muted-foreground">
              <span>
                {key} · {s.km} km from the catalogue epicentre
              </span>
              <span>
                P {pick.p !== null ? `${pick.p.toFixed(1)} s` : '—'} · S {pick.s !== null ? `${pick.s.toFixed(1)} s` : '—'}
                {pick.p !== null && pick.s !== null && ` · S−P ${(pick.s - pick.p).toFixed(1)} s`}
              </span>
            </figcaption>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-${key}`} className={`w-full rounded border bg-background ${readOnly ? '' : 'cursor-crosshair touch-none'}`} onPointerDown={(e) => place(e, s)} onPointerMove={(e) => place(e, s)}>
              <title id={`${id}-${key}`}>
                Vertical ground motion at {key}, {s.samples.length} seconds
              </title>
              <path d={path} fill="none" stroke="currentColor" strokeWidth={1} />
              {pick.p !== null && <line x1={x(pick.p)} x2={x(pick.p)} y1={0} y2={H} stroke="#dc2626" strokeWidth={2} />}
              {pick.s !== null && <line x1={x(pick.s)} x2={x(pick.s)} y1={0} y2={H} stroke="#2563eb" strokeWidth={2} />}
              {pick.p !== null && (
                <text x={x(pick.p) + 3} y={10} fill="#dc2626" className="text-[10px]">
                  P
                </text>
              )}
              {pick.s !== null && (
                <text x={x(pick.s) + 3} y={10} fill="#2563eb" className="text-[10px]">
                  S
                </text>
              )}
            </svg>
          </figure>
        )
      })}
      <p className="text-xs text-muted-foreground">
        Time runs left to right, {length} seconds in all; each trace is scaled to its own largest motion. Records from the EarthScope archive, block-averaged to one sample per second.
      </p>
    </div>
  )
}
