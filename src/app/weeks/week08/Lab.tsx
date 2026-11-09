import { useEffect, useId, useState } from 'react'
import { DataFooter } from '@/app/week/DataFooter'
import type { LabProps } from '@/app/week/WeekPage'
import { Button } from '@/components/ui/button'
import { BOUNDARY_LABEL } from '@/map/boundaries'
import { EMPTY_RELATIVE_MOTION, RELATIVE_MOTION_MARKS, relativeMotionWorksheetSchema, scoreRelativeMotion, type RelativeMotionWorksheet } from '@/engine/tectonics/worksheet'
import { GNSS_ATTRIBUTION, loadBundle, type Bundle } from './bundle'

const FIELDS: { key: 'east' | 'north' | 'speed' | 'azimuth'; label: string; unit: string }[] = [
  { key: 'east', label: 'Relative east component', unit: 'mm/yr' },
  { key: 'north', label: 'Relative north component', unit: 'mm/yr' },
  { key: 'speed', label: 'Relative speed', unit: 'mm/yr' },
  { key: 'azimuth', label: 'Direction', unit: 'degrees from north' },
]
const BOUNDARIES = [...(Object.keys(BOUNDARY_LABEL) as (keyof typeof BOUNDARY_LABEL)[]), 'none'] as const

const load = (data: unknown): RelativeMotionWorksheet => {
  const parsed = relativeMotionWorksheetSchema.safeParse(data)
  return parsed.success ? parsed.data : EMPTY_RELATIVE_MOTION
}

/**
 * Week 8 lab: relative motion between two GNSS stations. The learner names the stations, the sheet shows both
 * velocities as the bundle has them, and the learner works out the relative vector and the boundary type. The
 * checker recomputes from the same bundle.
 */
export function Lab({ progress, update }: LabProps) {
  const id = useId()
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const ws = load(progress.data)
  const save = (patch: Partial<RelativeMotionWorksheet>) => update({ data: { ...ws, ...patch, checked: false, score: null } })

  useEffect(() => {
    loadBundle()
      .then(setBundle)
      .catch((e) => setError(String(e)))
  }, [])

  const find = (code: string) => bundle?.field.stations.find((s) => s.station === code.trim().toUpperCase())
  const a = find(ws.a)
  const b = find(ws.b)
  const ready = a && b && a !== b
  const result = ready && bundle ? scoreRelativeMotion(ws, a, b, bundle.lines) : null

  const check = () => {
    if (!result) return
    update({ data: { ...ws, checked: true, score: result.score }, labDone: true })
  }

  return (
    <form
      className="grid max-w-prose gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        check()
      }}
    >
      <p className="text-muted-foreground">
        Find two stations on opposite sides of a plate boundary in the Explore pane and note their four-letter codes.
        The sheet fills in their velocities from the same data the globe draws. Work out how the second moves relative
        to the first, then say what kind of boundary lies between them.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {(['a', 'b'] as const).map((which) => {
          const station = which === 'a' ? a : b
          return (
            <div key={which} className="grid gap-1">
              <label htmlFor={`${id}-${which}`} className="font-medium">
                {which === 'a' ? 'First station (A)' : 'Second station (B)'}
              </label>
              <input id={`${id}-${which}`} className="rounded-md border bg-background p-2 font-mono text-sm uppercase" maxLength={4} value={ws[which]} onChange={(e) => save({ [which]: e.target.value.toUpperCase() })} />
              {station ? (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                  <dt className="text-muted-foreground">East</dt>
                  <dd>{station.ve.toFixed(1)} mm/yr</dd>
                  <dt className="text-muted-foreground">North</dt>
                  <dd>{station.vn.toFixed(1)} mm/yr</dd>
                  <dt className="text-muted-foreground">Position</dt>
                  <dd>
                    {station.lat.toFixed(2)}, {station.lon.toFixed(2)}
                  </dd>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">{ws[which].length === 4 && bundle ? 'No station with that code.' : 'Four-letter station code.'}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1">
            <label htmlFor={`${id}-${f.key}`} className="font-medium">
              {f.label} <span className="font-normal text-muted-foreground">({f.unit})</span>
            </label>
            <input id={`${id}-${f.key}`} type="number" step="0.1" className="rounded-md border bg-background p-2 text-sm" value={ws[f.key] ?? ''} onChange={(e) => save({ [f.key]: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
        ))}
      </div>

      <fieldset className="grid gap-1">
        <legend className="font-medium">Boundary between them</legend>
        <div className="flex flex-wrap gap-3">
          {BOUNDARIES.map((kind) => (
            <label key={kind} className="flex items-center gap-1 text-sm">
              <input type="radio" name={`${id}-boundary`} checked={ws.boundary === kind} onChange={() => save({ boundary: kind })} />
              {kind === 'none' ? 'None, same plate' : BOUNDARY_LABEL[kind]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!result}>
          Check
        </Button>
        {!bundle && !error && <p className="text-sm text-muted-foreground">Loading station data…</p>}
        {bundle && !ready && <p className="text-sm text-muted-foreground">Enter two different valid station codes to check.</p>}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          The station data could not load: {error}
        </p>
      )}

      {ws.checked && result && (
        <section aria-labelledby="result-heading" className="rounded-lg border bg-card p-4 text-sm">
          <h2 id="result-heading" className="font-medium">
            {result.score} of {RELATIVE_MOTION_MARKS}
          </h2>
          <ul className="mt-2 grid gap-1">
            <li>{result.speedOk ? 'Speed: right.' : `Speed: the data give ${result.expected.speed.toFixed(1)} mm/yr (east ${result.expected.east.toFixed(1)}, north ${result.expected.north.toFixed(1)}).`}</li>
            <li>{result.azimuthOk ? 'Direction: right.' : `Direction: the data give ${result.expected.azimuth.toFixed(0)}° from north.`}</li>
            <li>{result.boundaryOk ? 'Boundary: agrees with the nearest PB2002 segment.' : 'Boundary: does not agree with the nearest PB2002 segment within 200 km of the midpoint (or none is that close).'}</li>
          </ul>
          <p className="mt-2 text-muted-foreground">Change any entry to try again; your best attempt is what the week keeps.</p>
        </section>
      )}

      {bundle && <DataFooter snapshot={{ fetched_at: bundle.gnss.fetched, source_url: bundle.gnss.url, data: null }} attribution={GNSS_ATTRIBUTION} />}
    </form>
  )
}
